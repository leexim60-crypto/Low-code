// 物料组件配置
export const componentConfigs = {
  // ========== 基础组件 ==========
  button: {
    type: 'button',
    name: '按钮',
    icon: 'Pointer',
    category: 'base',
    props: {
      text: '按钮',
      type: 'primary',
      size: 'default',
      disabled: false,
      round: false
    },
    events: [],

    style: {
      width: 'auto',
      height: 'auto'
    }
  },
  text: {
    type: 'text',
    name: '文本',
    icon: 'Document',
    category: 'base',
    props: {
      content: '这是一段文本',
      tag: 'p'
    },
    events: [],

    style: {
      fontSize: '14px',
      color: '#333333',
      textAlign: 'left',
      lineHeight: '1.5'
    }
  },
  input: {
    type: 'input',
    name: '输入框',
    icon: 'Edit',
    category: 'base',
    props: {
      placeholder: '请输入内容',
      modelValue: '',
      type: 'text',
      disabled: false,
      clearable: true
    },
    events: [],

    style: {
      width: '220px'
    }
  },
  image: {
    type: 'image',
    name: '图片',
    icon: 'Picture',
    category: 'base',
    props: {
      src: 'https://via.placeholder.com/300x200',
      fit: 'contain',
      alt: '图片'
    },
    events: [],

    style: {
      width: '300px',
      height: '200px'
    }
  },
  divider: {
    type: 'divider',
    name: '分割线',
    icon: 'Minus',
    category: 'base',
    props: {
      direction: 'horizontal',
      borderStyle: 'solid'
    },
    events: [],

    style: {
      margin: '10px 0'
    }
  },
  icon: {
    type: 'icon',
    name: '图标',
    icon: 'Star',
    category: 'base',
    props: {
      name: 'Star',
      size: 24,
      color: '#f08a5d'
    },
    events: [],

    style: {}
  },
  link: {
    type: 'link',
    name: '链接',
    icon: 'Link',
    category: 'base',
    props: {
      text: '链接文字',
      href: '#',
      target: '_blank',
      disabled: false
    },
    events: [],

    style: {
      fontSize: '14px'
    }
  },

  // ========== 表单组件 ==========
  select: {
    type: 'select',
    name: '下拉选择',
    icon: 'ArrowDown',
    category: 'form',
    props: {
      placeholder: '请选择',
      options: [
        { label: '选项一', value: '1' },
        { label: '选项二', value: '2' },
        { label: '选项三', value: '3' }
      ],
      disabled: false,
      clearable: true
    },
    events: [],

    style: {
      width: '220px'
    }
  },
  radio: {
    type: 'radio',
    name: '单选框',
    icon: 'CircleCheck',
    category: 'form',
    props: {
      options: [
        { label: '选项一', value: '1' },
        { label: '选项二', value: '2' }
      ],
      modelValue: '1',
      disabled: false
    },
    events: [],

    style: {}
  },
  checkbox: {
    type: 'checkbox',
    name: '多选框',
    icon: 'Check',
    category: 'form',
    props: {
      options: [
        { label: '选项一', value: '1' },
        { label: '选项二', value: '2' },
        { label: '选项三', value: '3' }
      ],
      modelValue: [],
      disabled: false
    },
    events: [],

    style: {}
  },
  switchComp: {
    type: 'switchComp',
    name: '开关',
    icon: 'Open',
    category: 'form',
    props: {
      modelValue: false,
      disabled: false,
      activeText: '',
      inactiveText: ''
    },
    events: [],

    style: {}
  },
  textarea: {
    type: 'textarea',
    name: '文本域',
    icon: 'Memo',
    category: 'form',
    props: {
      placeholder: '请输入内容',
      modelValue: '',
      rows: 4,
      disabled: false,
      maxlength: '',
      showWordLimit: false
    },
    events: [],

    style: {
      width: '100%'
    }
  },
  datePicker: {
    type: 'datePicker',
    name: '日期选择',
    icon: 'Calendar',
    category: 'form',
    props: {
      placeholder: '请选择日期',
      format: 'YYYY-MM-DD',
      disabled: false,
      clearable: true
    },
    events: [],

    style: {
      width: '220px'
    }
  },
  timePicker: {
    type: 'timePicker',
    name: '时间选择',
    icon: 'Clock',
    category: 'form',
    props: {
      placeholder: '请选择时间',
      format: 'HH:mm:ss',
      disabled: false,
      clearable: true
    },
    events: [],

    style: {
      width: '220px'
    }
  },
  rate: {
    type: 'rate',
    name: '评分',
    icon: 'StarFilled',
    category: 'form',
    props: {
      modelValue: 3,
      max: 5,
      disabled: false,
      allowHalf: false,
      showText: true,
      texts: ['极差', '失望', '一般', '满意', '很满意']
    },
    events: [],

    style: {}
  },
  slider: {
    type: 'slider',
    name: '滑块',
    icon: 'Operation',
    category: 'form',
    props: {
      modelValue: 50,
      min: 0,
      max: 100,
      step: 1,
      disabled: false,
      showInput: false
    },
    events: [],

    style: {
      width: '300px'
    }
  },
  upload: {
    type: 'upload',
    name: '上传',
    icon: 'UploadFilled',
    category: 'form',
    props: {
      action: '#',
      multiple: false,
      limit: 3,
      accept: '',
      drag: false,
      tip: '只能上传jpg/png文件，且不超过500kb'
    },
    events: [],

    style: {}
  },

  // ========== 布局组件 ==========
  container: {
    type: 'container',
    name: '容器',
    icon: 'Box',
    category: 'layout',
    props: {},
    events: [],

    style: {
      width: '100%',
      minHeight: '200px',
      padding: '20px',
      backgroundColor: '#f5f7fa',
      border: '1px dashed #c0c4cc',
      borderRadius: '4px'
    },
    children: []
  },
  row: {
    type: 'row',
    name: '行',
    icon: 'Grid',
    category: 'layout',
    props: {
      gutter: 20,
      justify: 'start',
      align: 'top'
    },
    events: [],

    style: {},
    children: []
  },
  col: {
    type: 'col',
    name: '列',
    icon: 'Menu',
    category: 'layout',
    props: {
      span: 12
    },
    events: [],

    style: {},
    children: []
  },
  card: {
    type: 'card',
    name: '卡片',
    icon: 'Postcard',
    category: 'layout',
    props: {
      title: '卡片标题',
      shadow: 'hover',
      showHeader: true
    },
    events: [],

    style: {
      width: '100%'
    },
    children: []
  },
  tabs: {
    type: 'tabs',
    name: '标签页',
    icon: 'FolderOpened',
    category: 'layout',
    props: {
      tabs: [
        { label: '标签一', name: '1' },
        { label: '标签二', name: '2' },
        { label: '标签三', name: '3' }
      ],
      activeTab: '1',
      type: ''
    },
    events: [],

    style: {}
  },
  collapse: {
    type: 'collapse',
    name: '折叠面板',
    icon: 'Fold',
    category: 'layout',
    props: {
      items: [
        { title: '面板一', content: '内容一' },
        { title: '面板二', content: '内容二' }
      ],
      accordion: false
    },
    events: [],

    style: {}
  },

  // ========== 高级组件 ==========
  table: {
    type: 'table',
    name: '表格',
    icon: 'Grid',
    category: 'advanced',
    props: {
      columns: [
        { prop: 'date', label: '日期', width: '180' },
        { prop: 'name', label: '姓名', width: '180' },
        { prop: 'address', label: '地址' }
      ],
      data: [
        { date: '2024-01-01', name: '张三', address: '北京市朝阳区' },
        { date: '2024-01-02', name: '李四', address: '上海市浦东新区' },
        { date: '2024-01-03', name: '王五', address: '广州市天河区' }
      ],
      border: true,
      stripe: false,
      showHeader: true
    },
    events: [],

    style: {
      width: '100%'
    }
  },
  carousel: {
    type: 'carousel',
    name: '轮播图',
    icon: 'PictureFilled',
    category: 'advanced',
    props: {
      images: [
        { src: 'https://via.placeholder.com/800x400/409eff/fff?text=Slide+1', alt: '图片1' },
        { src: 'https://via.placeholder.com/800x400/67c23a/fff?text=Slide+2', alt: '图片2' },
        { src: 'https://via.placeholder.com/800x400/e6a23c/fff?text=Slide+3', alt: '图片3' }
      ],
      height: '300px',
      autoplay: true,
      interval: 3000,
      indicatorPosition: 'inside',
      arrow: 'hover'
    },
    events: [],

    style: {
      width: '100%'
    }
  },
  progress: {
    type: 'progress',
    name: '进度条',
    icon: 'Loading',
    category: 'advanced',
    props: {
      percentage: 70,
      status: '',
      strokeWidth: 6,
      textInside: false,
      showText: true,
      color: ''
    },
    events: [],

    style: {
      width: '100%'
    }
  },
  badge: {
    type: 'badge',
    name: '徽标',
    icon: 'Flag',
    category: 'advanced',
    props: {
      value: 12,
      max: 99,
      isDot: false,
      hidden: false,
      type: 'danger',
      text: '消息通知'
    },
    events: [],

    style: {}
  },
  tag: {
    type: 'tag',
    name: '标签',
    icon: 'PriceTag',
    category: 'advanced',
    props: {
      text: '标签',
      type: '',
      closable: false,
      effect: 'light',
      size: 'default'
    },
    events: [],

    style: {}
  },
  alert: {
    type: 'alert',
    name: '提示',
    icon: 'Warning',
    category: 'advanced',
    props: {
      title: '这是一条提示信息',
      type: 'info',
      description: '',
      closable: true,
      showIcon: true,
      center: false
    },
    events: [],

    style: {}
  },
  avatar: {
    type: 'avatar',
    name: '头像',
    icon: 'User',
    category: 'advanced',
    props: {
      src: 'https://via.placeholder.com/100',
      shape: 'circle',
      size: 'default',
      icon: 'User'
    },
    events: [],

    style: {}
  },
  breadcrumb: {
    type: 'breadcrumb',
    name: '面包屑',
    icon: 'Guide',
    category: 'advanced',
    props: {
      items: [
        { label: '首页', path: '/' },
        { label: '活动管理', path: '/activity' },
        { label: '活动列表' }
      ],
      separator: '/'
    },
    events: [],

    style: {}
  },
  pagination: {
    type: 'pagination',
    name: '分页',
    icon: 'More',
    category: 'advanced',
    props: {
      total: 100,
      currentPage: 1,
      pageSize: 10,
      pageSizes: [10, 20, 50, 100],
      layout: 'total, sizes, prev, pager, next, jumper',
      background: true
    },
    events: [],

    style: {}
  },

  // ========== 图表组件 ==========
  lineChart: {
    type: 'lineChart',
    name: '折线图',
    icon: 'TrendCharts',
    category: 'chart',
    props: {
      title: '折线图示例',
      xData: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
      series: [
        {
          name: '销量',
          data: [150, 230, 224, 218, 135, 147, 260]
        }
      ],
      showLegend: true,
      smooth: false
    },
    events: [],

    style: {
      width: '100%',
      height: '400px'
    }
  },
  barChart: {
    type: 'barChart',
    name: '柱状图',
    icon: 'Histogram',
    category: 'chart',
    props: {
      title: '柱状图示例',
      xData: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
      series: [
        {
          name: '销量',
          data: [120, 200, 150, 80, 70, 110, 130]
        }
      ],
      showLegend: true,
      horizontal: false
    },
    events: [],

    style: {
      width: '100%',
      height: '400px'
    }
  },
  pieChart: {
    type: 'pieChart',
    name: '饼图',
    icon: 'PieChart',
    category: 'chart',
    props: {
      title: '饼图示例',
      data: [
        { value: 1048, name: '搜索引擎' },
        { value: 735, name: '直接访问' },
        { value: 580, name: '邮件营销' },
        { value: 484, name: '联盟广告' },
        { value: 300, name: '视频广告' }
      ],
      showLegend: true,
      roseType: false,
      radius: '50%'
    },
    events: [],

    style: {
      width: '100%',
      height: '400px'
    }
  },
  radarChart: {
    type: 'radarChart',
    name: '雷达图',
    icon: 'Odometer',
    category: 'chart',
    props: {
      title: '雷达图示例',
      indicators: [
        { name: '销售', max: 6500 },
        { name: '管理', max: 16000 },
        { name: '信息技术', max: 30000 },
        { name: '客服', max: 38000 },
        { name: '研发', max: 52000 },
        { name: '市场', max: 25000 }
      ],
      series: [
        {
          name: '预算 vs 开销',
          data: [4200, 3000, 20000, 35000, 50000, 18000]
        }
      ]
    },
    events: [],

    style: {
      width: '100%',
      height: '400px'
    }
  },
  gaugeChart: {
    type: 'gaugeChart',
    name: '仪表盘',
    icon: 'Speedometer',
    category: 'chart',
    props: {
      title: '仪表盘示例',
      value: 72.18,
      name: '完成率',
      min: 0,
      max: 100
    },
    events: [],

    style: {
      width: '100%',
      height: '400px'
    }
  },

  // ========== 数据展示组件 ==========
  statistic: {
    type: 'statistic',
    name: '统计数值',
    icon: 'DataAnalysis',
    category: 'data',
    props: {
      title: '活跃用户',
      value: 26854,
      precision: 0,
      prefix: '',
      suffix: '人',
      valueStyle: { color: '#f08a5d' }
    },
    events: [],

    style: {}
  },
  countdown: {
    type: 'countdown',
    name: '倒计时',
    icon: 'Timer',
    category: 'data',
    props: {
      title: '距离活动开始',
      value: Date.now() + 1000 * 60 * 60 * 24 * 7,
      format: 'DD天HH时mm分ss秒'
    },
    events: [],

    style: {}
  },
  tree: {
    type: 'tree',
    name: '树形控件',
    icon: 'Share',
    category: 'data',
    props: {
      data: [
        {
          label: '一级 1',
          children: [
            {
              label: '二级 1-1',
              children: [
                { label: '三级 1-1-1' }
              ]
            }
          ]
        },
        {
          label: '一级 2',
          children: [
            { label: '二级 2-1' },
            { label: '二级 2-2' }
          ]
        }
      ],
      showCheckbox: false,
      defaultExpandAll: true,
      draggable: false
    },
    events: [],

    style: {}
  }
}

// 组件分类
export const componentCategories = [
  {
    name: 'base',
    label: '基础组件',
    icon: 'Coin'
  },
  {
    name: 'form',
    label: '表单组件',
    icon: 'EditPen'
  },
  {
    name: 'layout',
    label: '布局组件',
    icon: 'Grid'
  },
  {
    name: 'advanced',
    label: '高级组件',
    icon: 'MagicStick'
  },
  {
    name: 'chart',
    label: '图表组件',
    icon: 'TrendCharts'
  },
  {
    name: 'data',
    label: '数据展示',
    icon: 'DataAnalysis'
  }
]
