// Connect default zoom buttons
function initializeZoom(
  svg,
  svg_canvas,
  width,
  height,
  horizontal,
  dag,
  updateViewport
) {
  const zoom = d3
    .zoom()
    .scaleExtent([1, 40])
    // .extent([[0, 0], [mainWidth, mainHeight]])  // Define the size of the viewport
    // .translateExtent([[0, 0], [mainWidth, mainHeight]])  // Define the panning boundaries
    .on("zoom", function (event) {
      //   console.log("zoom", event);
      svg_canvas.attr("transform", event.transform);
      updateViewport(event.transform);
    });

  svg_canvas.call(zoom);

  d3.select("#zoom-in").on("click", function () {
    zoomIn(svg_canvas, zoom);
  });

  d3.select("#zoom-out").on("click", function () {
    zoomOut(svg_canvas, zoom);
  });

  d3.select("#zoom-reset").on("click", function () {
    zoomReset(svg_canvas, zoom, width, height, horizontal);
  });

  d3.select("#zoom-random").on("click", function () {
    zoomRandom(svg_canvas, dag, zoom, width, height, horizontal);
  });

  d3.select("#zoom-node").on("click", function () {
    zoomToNodeByName(
      svg_canvas,
      "EM_Stater",
      dag,
      zoom,
      width,
      height,
      horizontal
    );
  });

  return zoom;
}

// Define zoom functions
function zoomIn(svg, zoom) {
  svg.transition().duration(750).call(zoom.scaleBy, 1.2);
}

function zoomOut(svg, zoom) {
  svg.transition().duration(750).call(zoom.scaleBy, 0.8);
}

function zoomReset(svg, zoom, width, height) {
  svg
    .transition()
    .duration(750)
    .call(
      zoom.transform,
      d3.zoomIdentity,
      d3.zoomTransform(svg.node()).invert([width / 2, height / 2])
    );
}

function zoomClicked(event, [x, y]) {
  event.stopPropagation();
  svg
    .transition()
    .duration(750)
    .call(
      zoom.transform,
      d3.zoomIdentity
        .translate(width / 2, height / 2)
        .scale(40)
        .translate(-x, -y),
      d3.pointer(event)
    );
}

function zoomToNodeByName(svg, name, dag, zoom, width, height, horizontal) {
  console.log("zoomToNodeByName", name);
  for (const node of dag.nodes()) {
    if (node.data.label === name) {
      zoomToNode(svg, node, dag, zoom, width, height, horizontal);
      break;
    }
  }
}

function zoomRandom(svg, dag, zoom, width, height, horizontal) {
  // console.log("zoomRandom", dag);
  const data = [];
  for (const node of dag.nodes()) {
    // data.push([node.x, node.y]);
    data.push(node);
  }
  const node = data[Math.floor(Math.random() * data.length)];
  console.log("random node=", node.data.label, node);
  zoomToNode(svg, node, dag, zoom, width, height, horizontal);
}

function zoomToNode(
  svg,
  node,
  graphData,
  zoom,
  width,
  height,
  horizontal,
  showboundingBox = true
) {
  // 1. Identify the node's immediate neighbors
  const neighbors = getImmediateNeighbors(node, graphData);

  // 2. Compute the bounding box
  const boundingBox = computeBoundingBox(neighbors, horizontal);

  if (showboundingBox) {
    console.log("boundingBox", boundingBox);
    svg.selectAll(".boundingBox").remove();
    svg
      .append("rect")
      .attr("class", "boundingBox")
      .attr("x", boundingBox.x)
      .attr("y", boundingBox.y)
      .attr("width", boundingBox.width)
      .attr("height", boundingBox.height)
      .attr("fill", "none")
      .attr("stroke", "red");
  }

  // 3. Calculate the zoom scale and translation
  const { scale, translate } = calculateScaleAndTranslate(
    boundingBox,
    width,
    height,
    horizontal
  );

  console.log("scale", scale);
  console.log("translate", translate);

  // 4. Apply the zoom transform
  svg
    .transition()
    .duration(750)
    .call(
      zoom.transform,
      d3.zoomIdentity.translate(translate.x, translate.y).scale(scale)
    );
}

function getImmediateNeighbors(baseNode, graphData) {
  // console.log("getImmediateNeighbors baseNode",baseNode);
  // console.log("getImmediateNeighbors graphData",graphData);
  const neighbors = [baseNode];

  // Iterate over all edges to find connected nodes
  for (const node of graphData.nodes()) {
    if (
      baseNode.data.parentIds.includes(node.data.id) ||
      baseNode.data.childrenIds.includes(node.data.id)
    ) {
      // console.log("getImmediateNeighbors node", node);
      neighbors.push(node);
    }
  }

  return neighbors;
}

function computeBoundingBox(nodes, horizontal) {
  const padding = 2; // Add some padding
  console.log("computeBoundingBox nodes", nodes);

  let [minX, minY, maxX, maxY] = [Infinity, Infinity, -Infinity, -Infinity];

  const updateBounds = (x, y, dimension1, dimension2) => {
    minX = Math.min(minX, x - dimension1 / 2);
    minY = Math.min(minY, y - dimension2 / 2);
    maxX = Math.max(maxX, x + dimension1 / 2);
    maxY = Math.max(maxY, y + dimension2 / 2);
  };

  nodes.forEach((n) => {
    const {
      x,
      y,
      data: { width, height },
    } = n;

    if (horizontal) {
      updateBounds(y, x, width, height);
    } else {
      updateBounds(x, y, width, height);
    }
  });

  return {
    x: minX - padding,
    y: minY - padding,
    width: maxX - minX + 2 * padding,
    height: maxY - minY + 2 * padding,
  };
}

function calculateScaleAndTranslate(
  boundingBox,
  svgWidth,
  svgHeight,
  horizontal
) {
  const scale = Math.min(
    svgWidth / boundingBox.width,
    svgHeight / boundingBox.height
  );

  const translateX =
    svgWidth / 2 - scale * (boundingBox.x + boundingBox.width / 2);
  const translateY =
    svgHeight / 2 - scale * (boundingBox.y + boundingBox.height / 2);

  if (horizontal) {
    // Reverse the x and y translations
    return {
      scale: scale,
      translate: {
        x: translateY,
        y: translateX,
      },
    };
  } else {
    return {
      scale: scale,
      translate: {
        x: translateX,
        y: translateY,
      },
    };
  }
}
