// components/areasPicker/areasPicker.js
import {areaJSData} from "../../data/pca-code.js";

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    showAreas: {
      type: Boolean,
      observer: function(val) {
        if (val === true) this._show();
      },
    },// 区域弹窗
    areasLevel: {
      type: Number,
      value: 3,
    },// 区域末级 1省、2市、3区、4镇
    areasValue: {
      type: Array,
      value: [],
      observer: function(val) {
        if (val.length > 0) {
          this.setData({
            selectData: val
          });
        }
        // 有数据默认初始化
        this._get(true);
      },
    },// 默认数据，格式： [{id: 0, name: '省'},{id: 1, name: '市'}]
  },

  ready() {
  },

  /**
   * 组件的初始数据
   */
  data: {
    dialog: false,
    areasData: '',// 区域数据
    selectData: [
      {
        name: '请选择',
        id: '',
      },
      {
        name: '请选择',
        id: '',
      },
      {
        name: '请选择',
        id: '',
      },
      {
        name: '请选择',
        id: '',
      },
    ],// 已选省市区值
    selectIndex: 0,// 默认选择索引
  },

  /**
   * 组件的方法列表
   */
  methods: {

    /**
     * 获取模拟数据
     * @author crl
     * @param  {Boolean} reDiff 是否重新处理数据
     * @return {[type]}
     */
    _get(reDiff=false) {
      // 缓存里面拿
      const areasData = wx.getStorageSync('areasData');
      if (areasData) {
        this._init(areasData, reDiff);
        return;
      }
      this._init(areaJSData, reDiff);

      // 远程示例
      // wx.showLoading({ title: '加载中...', mask: true });
      // wx.request({
      //   // 必需
      //   url: '/data/pac-code.json',// 远程json数据
      //   data: {
      //   },
      //   header: {
      //     'Content-Type': 'application/json'
      //   },
      //   success: (res) => {
      //     if (res.data && res.data.status && res.data.data) {
      //       this._init(res.data.data, reDiff);
      //     }
      //   },
      //   complete: () => {
      //     wx.hideLoading();
      //   }
      // });
    },

    /**
     * 初始化数据
     * @author crl
     * @param  {false}  data   数据
     * @param  {Boolean} reDiff 是否重新初始化
     * @return {[type]}
     */
    _init(data, reDiff=false) {
      // 地区数据不存在，初始化所有数据
      if (!data) {
        this.setData({
          selectIndex: 0,
          selectData: [{name: '请选择', id: ''},{name: '请选择', id: ''},{name: '请选择', id: ''},{name: '请选择', id: ''}],
        });
        return;
      }

      let selectData = this.data.selectData;
      let selectIndex = 0;
      for (let i = 0; i < selectData.length; i++) {
        if (selectData[i].id) selectIndex = i;
      }
      this.setData({
        selectIndex
      });
      wx.setStorageSync('areasData', data);
      if (reDiff) {
        this._align();
      }
    },

    /**
     * 显示弹窗
     * @author crl
     */
    _show() {
      this.setData({
        dialog: true
      });
      this._align();
    },

    /**
     * 关闭弹窗
     * @author crl
     * @param  {Boolean} action 是否主动关闭
     * @return {[type]}
     */
    _hide(action=true) {
      this.setData({
        dialog: false,
        showAreas: false,
      });
      if (action) {
        this.triggerEvent("Callback",{type: 'fail',value: ''});
        return;
      }

      let selectData = this.data.selectData;
      let res = {
        province: selectData[0].id ? selectData[0] : '',
        city: selectData[1].id ? selectData[1] : '',
        area: selectData[2].id ? selectData[2] : '',
        streets: selectData[3].id ? selectData[3] : ''
      };
      this.triggerEvent("Callback",{type: 'success', value: res});
    },

    /**
     * 区域选择
     * @author crl
     */
    _select(e) {
      let selectIndex = this.data.selectIndex;
      const id = "selectData[" + selectIndex + "].id";
      const name = "selectData[" + selectIndex + "].name";
      const items = e.currentTarget.dataset;

      this.setData({
        [id]: items.id,
        [name]: items.name,
      });

      if (selectIndex < (this.data.areasLevel-1)) {
        this.setData({
          selectIndex: selectIndex+1,
        });
        this._align();
      } else {
        // 末级直接关闭
        this._hide(false);
      }
    },

    /**
     * 数据检查
     * @author crl
     */
    _checkSelected() {
      let selectIndex = this.data.selectIndex;
      let tmp = '';
      switch (selectIndex) {
      case 1:
        tmp = this.data.cityData;
        break;
      case 2:
        tmp = this.data.districtData;
        break;
      case 3:
        tmp = this.data.streetData;
        break;
      default:
        tmp = this.data.provinceData;
        break;
      }
      this.setData({
        areasData: tmp
      });
    },

    /**
     * 省市区数据对齐
     * @author crl
     */
    _align() {
      let areasData = wx.getStorageSync('areasData');
      let selectData = this.data.selectData;
      let provinceData = this.data.provinceData, cityData, districtData, streetData;
      if (!areasData) {
        this._get(true);
        return;
      }

      try {
        // 省
        if (!provinceData) {// 防止数据过载
          provinceData = areasData.map(k => {return {name: k.name, id: k.code};});
          this.setData({
            provinceData: provinceData
          });
        }

        // 市
        let p = this._checkIndex(provinceData, selectData[0].id);
        if (areasData[p].children) {
          cityData = areasData[p].children.map(k => {return {name: k.name, id: k.code, children: k.children};});
          this.setData({
            cityData: cityData
          });
        }else {
          this.setData({
            cityData: [{name: '全部', id: -1, children: null}]
          });
        }

        // 区
        let c = this._checkIndex(cityData,selectData[1].id);
        if (cityData[c].children) {
          districtData = cityData[c].children.map(k => {return {name: k.name, id: k.code, children: k.children};});
          this.setData({
            districtData: districtData
          });
        }else {
          this.setData({
            districtData: [{name: '全部', id: -1, children: null}]
          });
        }

        // 镇
        let d = this._checkIndex(districtData,selectData[2].id);
        if (districtData[d].children) {
          streetData = districtData[d].children.map(k => {return {name: k.name, id: k.code, children: k.children};});
          this.setData({
            streetData: streetData
          });
        }else {
          this.setData({
            streetData: [{name: '全部', id: -1, children: null}]
          });
        }

        this._checkSelected();

      } catch(e) {
        console.error(e);
      }
    },

    /**
     * 获取索引值
     * @author crl
     * @param  {Array} data  数据
     * @param  {Number} id   所在层级 id
     * @return {Number}
     */
    _checkIndex(data, id) {
      let idx = 0;
      if (!data || id == '') return 0;

      // 初始值与区域数据不匹配，一律归零
      if (!data.some(k => k.id == id)) {
        this.setData({
          selectIndex: 0,
          selectData: [{name: '请选择', id: ''},{name: '请选择', id: ''},{name: '请选择', id: ''},{name: '请选择', id: ''}],
        });
        return 0;
      }

      // 查找索引
      if (data && id != -1) {
        idx = data.findIndex(k => k.id == id);
      }
      if (idx === -1) {
        // this._checkValue(level);
        idx = 0;
      }
      return idx;
    },

    /**
     * 处理层级数据
     * @author crl
     * @param  {Number} idx 所在层级
     * @return {[type]}
     */
    _checkValue(idx) {
      let selectData = this.data.selectData;
      for (let i = 0; i < selectData.length; i++) {
        if (idx <= i) {
          selectData[i] = {name: '请选择', id: ''};
        }
      }
      this.setData({
        selectIndex: idx,
        selectData: selectData
      });
    },

    /**
     * 省市区 Tab
     * @author crl
     */
    _changeArea(e) {
      let idx = e.currentTarget.dataset.i;// 0省、1市、2区
      this._checkValue(idx);
      this._align();
    }
  }
});
