// import BaseNode from "./nodeBase.js";
import BaseContainerNode from "./nodeBaseContainer.js";
import RectangularNode from "./nodeRect.js";
import { getComputedDimensions } from "./utils.js";
import { renderLinks } from "./links.js";

export default class AdapterNode extends BaseContainerNode {
  constructor(nodeData, parentElement, parentNode = null) {
    if (!nodeData.width) nodeData.width = 334;
    if (!nodeData.height) nodeData.height = 74;
    if (!nodeData.layout) nodeData.layout = 1;

    super(nodeData, parentElement, parentNode);

    this.stagingNode = null;
    this.transformNode = null;
    this.archiveNode = null;
    this.nodeSpacing = { horizontal: 20, vertical: 10 };
  }

  async renderChildren() {
    console.log("    Rendering Children for Adapter:", this.id, this.data.children);
    if (!this.data.children || this.data.children.length === 0) {
      return;
    }

    // render "archive" node
    let archiveChild = this.data.children.find((child) => child.category === "archive");
    if (archiveChild) {
      console.log("    Rendering Archive Node:", archiveChild, this);
      this.archiveNode = new RectangularNode(archiveChild, this.container, this);
      this.archiveNode.render();
    }

    // render "staging" node
    let stagingChild = this.data.children.find((child) => child.category === "staging");
    if (stagingChild) {
      this.stagingNode = new RectangularNode(stagingChild, this.container, this);
      this.stagingNode.render();
    }

    // render "transform" node
    let transformChild = this.data.children.find((child) => child.category === "transform");
    if (transformChild) {
      this.transformNode = new RectangularNode(transformChild, this.container, this);
      this.transformNode.render();
    }

    // store the child nodes in an array for following the requirements of the base container node
    this.childNodes.push(this.stagingNode);
    this.childNodes.push(this.archiveNode);
    this.childNodes.push(this.transformNode);

    this.layoutChildren();

    const links = [];
    links.push({ source: this.stagingNode, target: this.transformNode });
    links.push({ source: this.stagingNode, target: this.archiveNode });
    renderLinks(links, this.container);
  }

  layoutChildren() {
    console.log("    Layout for Adapter:", this.id, this.data.layout);
    switch (this.data.layout) {
      case 1:
        this.layout1();
        break;
      case 2:
        this.layout2();
        break;
      case 3:
        this.layout3();
        break;
    }
  }

  async layout1() {
    if (this.stagingNode) {
      const x = -this.data.width / 2 + this.stagingNode.data.width / 2 + this.containerMargin.left;
      const y = -this.data.height / 2 + this.stagingNode.data.height / 2 + this.containerMargin.top;
      this.stagingNode.element.attr("transform", `translate(${x}, ${y})`);

      this.stagingNode.x = x;
      this.stagingNode.y = y;
    }

    if (this.archiveNode) {
      const x =
        -this.data.width / 2 +
        this.archiveNode.data.width / 2 +
        this.containerMargin.left +
        this.stagingNode.data.width +
        this.nodeSpacing.horizontal;
      const y = -this.data.height / 2 + this.archiveNode.data.height / 2 + this.containerMargin.top;
      this.archiveNode.element.attr("transform", `translate(${x}, ${y})`);

      this.archiveNode.x = x;
      this.archiveNode.y = y;
    }

    if (this.transformNode) {
      // first resize the transform node to fit the width of the other two nodes
      const width =
        this.stagingNode.data.width +
        this.archiveNode.data.width -
        this.stagingNode.data.width / 2 +
        this.nodeSpacing.horizontal -
        +2 * this.nodeSpacing.horizontal;
      const height = this.transformNode.data.height;
      this.transformNode.resize({ width: width, height: height });

      // then position the transform node based on the new size
      const x =
        -this.data.width / 2 +
        this.transformNode.data.width / 2 +
        this.containerMargin.left +
        this.stagingNode.data.width / 2 +
        2 * this.nodeSpacing.horizontal;
      const y =
        -this.data.height / 2 +
        this.transformNode.data.height / 2 +
        this.containerMargin.top +
        this.archiveNode.data.height +
        this.nodeSpacing.vertical;
      this.transformNode.element.attr("transform", `translate(${x}, ${y})`);

      this.transformNode.x = x;
      this.transformNode.y = y;
    }
  }

  async layout2() {
    if (this.stagingNode) {
      const x = -this.data.width / 2 + this.stagingNode.data.width / 2 + this.containerMargin.left;
      const y =
        -this.data.height / 2 +
        this.stagingNode.data.height / 2 +
        this.containerMargin.top +
        this.archiveNode.data.height +
        this.nodeSpacing.vertical;
      this.stagingNode.element.attr("transform", `translate(${x}, ${y})`);

      this.stagingNode.x = x;
      this.stagingNode.y = y;
    }

    if (this.archiveNode) {
      const x =
        -this.data.width / 2 +
        this.archiveNode.data.width / 2 +
        this.containerMargin.left +
        this.archiveNode.data.width / 2 +
        this.nodeSpacing.horizontal;
      const y = -this.data.height / 2 + this.archiveNode.data.height / 2 + this.containerMargin.top;
      this.archiveNode.element.attr("transform", `translate(${x}, ${y})`);

      this.archiveNode.x = x;
      this.archiveNode.y = y;
    }

    if (this.transformNode) {
      const x =
        -this.data.width / 2 +
        this.transformNode.data.width / 2 +
        this.containerMargin.left +
        this.stagingNode.data.width +
        this.nodeSpacing.horizontal;
      const y =
        -this.data.height / 2 +
        this.transformNode.data.height / 2 +
        this.containerMargin.top +
        this.archiveNode.data.height +
        this.nodeSpacing.vertical;
      this.transformNode.element.attr("transform", `translate(${x}, ${y})`);

      this.transformNode.x = x;
      this.transformNode.y = y;
    }
  }

  async layout3() {
    if (this.stagingNode) {
      // first resize the staging node to fit the height of the other two nodes
      const width = this.stagingNode.data.width;
      const height = this.archiveNode.data.height + this.transformNode.data.height + this.nodeSpacing.vertical;
      this.stagingNode.resize({ width: width, height: height });

      // then position the staging node based on the new size
      const x = -this.data.width / 2 + this.stagingNode.data.width / 2 + this.containerMargin.left;
      const y = -this.data.height / 2 + this.stagingNode.data.height / 2 + this.containerMargin.top;
      this.stagingNode.element.attr("transform", `translate(${x}, ${y})`);

      this.stagingNode.x = x;
      this.stagingNode.y = y;
    }

    if (this.archiveNode) {
      const x =
        -this.data.width / 2 +
        this.archiveNode.data.width / 2 +
        this.containerMargin.left +
        this.stagingNode.data.width +
        this.nodeSpacing.horizontal;
      const y = -this.data.height / 2 + this.archiveNode.data.height / 2 + this.containerMargin.top;
      this.archiveNode.element.attr("transform", `translate(${x}, ${y})`);

      this.archiveNode.x = x;
      this.archiveNode.y = y;
    }

    if (this.transformNode) {
      const x =
        -this.data.width / 2 +
        this.transformNode.data.width / 2 +
        this.containerMargin.left +
        this.stagingNode.data.width +
        this.nodeSpacing.horizontal;
      const y =
        -this.data.height / 2 +
        this.transformNode.data.height / 2 +
        this.containerMargin.top +
        this.archiveNode.data.height +
        this.nodeSpacing.vertical;
      this.transformNode.element.attr("transform", `translate(${x}, ${y})`);

      this.transformNode.x = x;
      this.transformNode.y = y;
    }
  }
}
