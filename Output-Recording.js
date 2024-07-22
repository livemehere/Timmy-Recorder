const outputRecording = {
  nameSubCategory: 'Recording',
  parameters: [
    {
      name: 'RecType',
      type: 'OBS_PROPERTY_LIST',
      description: 'Type',
      subType: 'OBS_COMBO_FORMAT_STRING',
      currentValue: 'Standard',
      values: [Array],
      visible: true,
      enabled: true,
      masked: false
    },
    {
      name: 'RecFilePath',
      type: 'OBS_PROPERTY_PATH',
      description: 'Recording Path',
      subType: '',
      currentValue: 'C:\\Users\\rhdxoals\\Videos',
      values: [],
      visible: true,
      enabled: true,
      masked: false
    },
    {
      name: 'RecFileNameWithoutSpace',
      type: 'OBS_PROPERTY_BOOL',
      description: 'Generate File Name without Space',
      subType: '',
      currentValue: false,
      values: [],
      visible: true,
      enabled: true,
      masked: false
    },
    {
      name: 'RecFormat',
      type: 'OBS_PROPERTY_LIST',
      description: 'Recording Format',
      subType: 'OBS_COMBO_FORMAT_STRING',
      currentValue: 'mp4',
      values: [Array],
      visible: true,
      enabled: true,
      masked: false
    },
    {
      name: 'RecTracks',
      type: 'OBS_PROPERTY_BITMASK',
      description: 'Audio Track',
      subType: '',
      currentValue: 1,
      minVal: -200,
      maxVal: 200,
      stepVal: 1,
      values: [],
      visible: true,
      enabled: true,
      masked: false
    },
    {
      name: 'RecEncoder',
      type: 'OBS_PROPERTY_LIST',
      description: 'Recording',
      subType: 'OBS_COMBO_FORMAT_STRING',
      currentValue: 'jim_nvenc',
      values: [Array],
      visible: true,
      enabled: true,
      masked: false
    },
    {
      name: 'RecRescale',
      type: 'OBS_PROPERTY_BOOL',
      description: 'Rescale Output',
      subType: '',
      currentValue: false,
      values: [],
      visible: false,
      enabled: true,
      masked: false
    },
    {
      name: 'RecMuxerCustom',
      type: 'OBS_PROPERTY_EDIT_TEXT',
      description: 'Custom Muxer Settings',
      subType: '',
      currentValue: '',
      values: [],
      visible: true,
      enabled: true,
      masked: false
    },
    {
      name: 'Recrate_control',
      type: 'OBS_PROPERTY_LIST',
      description: 'Rate Control',
      subType: 'OBS_COMBO_FORMAT_STRING',
      currentValue: 'CBR',
      values: [Array],
      visible: true,
      enabled: true,
      masked: false
    },
    {
      name: 'Recbitrate',
      type: 'OBS_PROPERTY_INT',
      description: 'Bitrate',
      subType: 'OBS_COMBO_FORMAT_STRING',
      currentValue: 2500,
      minVal: 50,
      maxVal: 300000,
      stepVal: 50,
      values: [Array],
      visible: true,
      enabled: true,
      masked: false
    },
    {
      name: 'Recmax_bitrate',
      type: 'OBS_PROPERTY_INT',
      description: 'Max Bitrate',
      subType: 'OBS_COMBO_FORMAT_STRING',
      currentValue: 5000,
      minVal: 50,
      maxVal: 300000,
      stepVal: 50,
      values: [Array],
      visible: false,
      enabled: true,
      masked: false
    },
    {
      name: 'Reccqp',
      type: 'OBS_PROPERTY_INT',
      description: 'CQ Level',
      subType: 'OBS_COMBO_FORMAT_STRING',
      currentValue: 20,
      minVal: 1,
      maxVal: 30,
      stepVal: 1,
      values: [Array],
      visible: false,
      enabled: true,
      masked: false
    },
    {
      name: 'Reckeyint_sec',
      type: 'OBS_PROPERTY_INT',
      description: 'Keyframe Interval (seconds, 0=auto)',
      subType: 'OBS_COMBO_FORMAT_STRING',
      currentValue: 0,
      minVal: 0,
      maxVal: 10,
      stepVal: 1,
      values: [Array],
      visible: true,
      enabled: true,
      masked: false
    },
    {
      name: 'Recpreset',
      type: 'OBS_PROPERTY_LIST',
      description: 'Preset',
      subType: 'OBS_COMBO_FORMAT_STRING',
      currentValue: 'hq',
      values: [Array],
      visible: true,
      enabled: true,
      masked: false
    },
    {
      name: 'Recprofile',
      type: 'OBS_PROPERTY_LIST',
      description: 'Profile',
      subType: 'OBS_COMBO_FORMAT_STRING',
      currentValue: 'high',
      values: [Array],
      visible: true,
      enabled: true,
      masked: false
    },
    {
      name: 'Reclookahead',
      type: 'OBS_PROPERTY_BOOL',
      description: 'Look-ahead',
      subType: 'OBS_COMBO_FORMAT_STRING',
      currentValue: false,
      values: [Array],
      visible: true,
      enabled: true,
      masked: false
    },
    {
      name: 'Recpsycho_aq',
      type: 'OBS_PROPERTY_BOOL',
      description: 'Psycho Visual Tuning',
      subType: 'OBS_COMBO_FORMAT_STRING',
      currentValue: true,
      values: [Array],
      visible: true,
      enabled: true,
      masked: false
    },
    {
      name: 'Recgpu',
      type: 'OBS_PROPERTY_INT',
      description: 'GPU',
      subType: 'OBS_COMBO_FORMAT_STRING',
      currentValue: 0,
      minVal: 0,
      maxVal: 8,
      stepVal: 1,
      values: [Array],
      visible: true,
      enabled: true,
      masked: false
    },
    {
      name: 'Recbf',
      type: 'OBS_PROPERTY_INT',
      description: 'Max B-frames',
      subType: 'OBS_COMBO_FORMAT_STRING',
      currentValue: 2,
      minVal: 0,
      maxVal: 4,
      stepVal: 1,
      values: [Array],
      visible: true,
      enabled: true,
      masked: false
    }
  ]
};
