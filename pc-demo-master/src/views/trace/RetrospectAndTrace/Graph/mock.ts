export interface IRawData {
  events: {
      eventTypeName: string
      eventId: number
      operator: string | null
      eventTime: string
      memo: {
          field: string
          value: string
      }[]
  }[]
  relations: {
    startEventId: number,
    endEventId: number,
    objects: string[]
  }[]
}

export const mockGraphData = {
  events: [
    // {
    //   eventTypeName: 'mockEvent',
    //   eventId: 1219,
    //   operator: '管理员',
    //   eventTime: '2024-03-20T10:18:16',
    //   memo: [
    //     {
    //       field: 'mock field',
    //       value: 'mock value'
    //     },
    //   ]
    // },
    // {
    //   eventTypeName: 'mockEvent2',
    //   eventId: 1118,
    //   operator: '管理员',
    //   eventTime: '2024-03-20T10:18:16',
    //   memo: [
    //     {
    //       field: 'mock field',
    //       value: 'mock value'
    //     },
    //     {
    //       field: 'mock field2',
    //       value: 'mock value'
    //     },
    //   ]
    // },
    {
      eventTypeName: '调拨入库',
      eventId: 1220,
      operator: '管理员',
      eventTime: '2024-03-20T11:18:16',
      // x: 570,
      // y: 185,
      memo: [
        {
          field: '仓库名称',
          value: '秦明测试'
        },
        {
          field: '库位名称',
          value: '秦明测试_库位'
        }
      ]
    },
    {
      eventTypeName: '调拨出库',
      eventId: 1217,
      operator: '管理员',
      eventTime: '2024-03-20T11:15:40',
      // x: 240,
      // y: 185,
      memo: [
        {
          field: '仓库名称',
          value: '秦明测试'
        },
        {
          field: '库位名称',
          value: '秦明测试_库位'
        }
      ]
    }
  ],
  relations: [
    // {
    //   startEventId: 1219,
    //   objects: ['mywBe0Ntgu'],
    //   endEventId: 1217
    // },
    // {
    //   startEventId: 1118,
    //   objects: ['mywBe0Ntgu'],
    //   endEventId: 1217
    // },
    {
      startEventId: 1217,
      objects: ['mywBe0Ntgu', 'mockObject1', 'mockObject2', 'mockObject3'],
      endEventId: 1220
    }
  ]
}

export const mockGraphData2 = {
  events: [
    {
      eventTypeName: 'mockEvent6',
      eventId: 1214,
      operator: '管理员',
      eventTime: '2024-03-20T10:10:16',
      memo: [
        {
          field: 'mock field1',
          value: 'mock value'
        },
      ]
    },
    {
      eventTypeName: 'mockEvent4',
      eventId: 1215,
      operator: '管理员',
      eventTime: '2024-03-20T10:10:16',
      memo: [
      ]
    },
    {
      eventTypeName: 'mockEvent3',
      eventId: 1216,
      operator: '管理员',
      eventTime: '2024-03-20T10:15:16',
      memo: [
        {
          field: 'mock field1',
          value: 'mock value'
        },
        {
          field: 'mock field2',
          value: 'mock value'
        },
      ]
    },
    {
      eventTypeName: 'mockEvent2',
      eventId: 1218,
      operator: '管理员',
      eventTime: '2024-03-20T10:17:16',
      memo: [
        {
          field: 'mock field1',
          value: 'mock value'
        },
        {
          field: 'mock field2',
          value: 'mock value'
        },
      ]
    },
    {
      eventTypeName: 'mockEvent1',
      eventId: 1219,
      operator: '管理员',
      eventTime: '2024-03-20T10:18:16',
      memo: [
        {
          field: 'mock field',
          value: 'mock value'
        },
      ]
    },
    {
      eventTypeName: '调拨入库',
      eventId: 1220,
      operator: '管理员',
      eventTime: '2024-03-20T11:18:16',
      memo: [
        {
          field: '仓库名称',
          value: '秦明测试'
        },
        {
          field: '库位名称',
          value: '秦明测试_库位'
        }
      ]
    },
    {
      eventTypeName: '调拨出库',
      eventId: 1217,
      operator: '管理员',
      eventTime: '2024-03-20T11:15:40',
      memo: [
        {
          field: '仓库名称',
          value: '秦明测试'
        },
        {
          field: '库位名称',
          value: '秦明测试_库位'
        }
      ]
    }
  ],
  relations: [
    {
      startEventId: 1214,
      objects: ['mywBe0Ntgu'],
      endEventId: 1215
    },
    {
      startEventId: 1215,
      objects: ['mywBe0Ntgu'],
      endEventId: 1216
    },
    {
      startEventId: 1215,
      objects: ['mywBe0Ntgu'],
      endEventId: 1218
    },
    {
      startEventId: 1216,
      objects: ['mywBe0Ntgu'],
      endEventId: 1217
    },
    {
      startEventId: 1218,
      objects: ['mywBe0Ntgu'],
      endEventId: 1219
    },
    {
      startEventId: 1219,
      objects: ['mywBe0Ntgu'],
      endEventId: 1217
    },
    {
      startEventId: 1217,
      objects: ['mywBe0Ntgu', 'mockObject1', 'mockObject2', 'mockObject3'],
      endEventId: 1220
    }
  ]
}

export const mockGraphData3 = {
  events: [
    {
      eventTypeName: '调拨入库',
      eventId: 1220,
      operator: '管理员',
      eventTime: '2024-03-20T11:18:16',
      x: 570,
      y: 185,
      memo: [
        {
          field: '仓库名称',
          value: '秦明测试'
        },
        {
          field: '库位名称',
          value: '秦明测试_库位'
        }
      ]
    },
    {
      eventTypeName: '调拨出库',
      eventId: 1217,
      operator: '管理员',
      eventTime: '2024-03-20T11:15:40',
      x: 240,
      y: 185,
      memo: [
        {
          field: '仓库名称',
          value: '秦明测试'
        },
        {
          field: '库位名称',
          value: '秦明测试_库位'
        }
      ]
    },
    {
      eventTypeName: 'mock1',
      eventId: 1221,
      operator: '管理员',
      eventTime: '2024-03-20T11:18:16',
      x: 570,
      y: 185,
      memo: [
        {
          field: '仓库名称',
          value: '秦明测试'
        },
        {
          field: '库位名称',
          value: '秦明测试_库位'
        }
      ]
    },
    {
      eventTypeName: 'mock2',
      eventId: 1222,
      operator: '管理员',
      eventTime: '2024-03-20T11:18:16',
      x: 570,
      y: 185,
      memo: [
        {
          field: '仓库名称',
          value: '秦明测试'
        },
        {
          field: '库位名称',
          value: '秦明测试_库位'
        }
      ]
    },
    {
      eventTypeName: 'mock3',
      eventId: 1223,
      operator: '管理员',
      eventTime: '2024-03-20T11:18:16',
      x: 570,
      y: 185,
      memo: [
        {
          field: '仓库名称',
          value: '秦明测试'
        },
        {
          field: '库位名称',
          value: '秦明测试_库位'
        }
      ]
    },
  ],
  relations: [
    {
      startEventId: 1217,
      objects: ['mywBe0Ntgu', 'mockObject1', 'mockObject2', 'mockObject3'],
      endEventId: 1220
    },
    {
      startEventId: 1220,
      objects: ['mywBe0Ntgu', 'mockObject1', 'mockObject2', 'mockObject3'],
      endEventId: 1221
    },
    {
      startEventId: 1220,
      objects: ['mywBe0Ntgu', 'mockObject1', 'mockObject2', 'mockObject3'],
      endEventId: 1222
    },
    {
      startEventId: 1222,
      objects: ['mywBe0Ntgu', 'mockObject1', 'mockObject2', 'mockObject3'],
      endEventId: 1223
    },
    {
      startEventId: 1221,
      objects: ['mywBe0Ntgu', 'mockObject1', 'mockObject2', 'mockObject3'],
      endEventId: 1223
    },
  ]
}
