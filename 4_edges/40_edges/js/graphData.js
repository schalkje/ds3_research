//////////////////////////////////////////////////////////////
//
// Setup data
//

export const testDashboard1 = {
  settings: {
    showCenterMark: true,
    showGhostlines: false,

    // ideas
    showGrid: true,
    showGroupLabels: true,
    showGroupTitles: true,
  },
  nodes: [
    {
      id: "group",
      label: "Group",
      type: "columns",
      groupType: "fixed",
      layout: {
        displayMode: "code",
      },
      children: [
        {
          id: "bankview",
          label: "Bankview",
          type: "node",
        },
        {
          id: "matrix",
          label: "Matrix",
          type: "node",
        },
      ],
    },
  ],
  "edges": [
    {
      isActive: true,
      source: "bankview",
      type: "SSIS",
      state: "Ready",
      target: "matrix"
    },
  ]
};

export const testDashboard2 = {
  settings: {
    showCenterMark: false,

    // edges
    showGhostlines: false,

    // ideas
    showGrid: true,
    showGroupLabels: true,
    showGroupTitles: true,
  },
  nodes: [
    {
      id: "group",
      label: "Group",
      type: "lane",
      groupType: "fixed",
      layout: {
        displayMode: "code",
      },
      children: [
        {
          id: "bankview",
          label: "Bankview",
          type: "adapter",
        },
        {
          id: "matrix",
          label: "Matrix",
          type: "foundation",
        },
      ],
    },
  ],
  "edges": [
    {
      isActive: true,
      source: "bankview",
      type: "SSIS",
      state: "Ready",
      target: "matrix"
    },
  ]
};

