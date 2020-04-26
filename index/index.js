Page({
  data: {
    areasValue: [{id: "62", name: "甘肃省"},{id: "6311", name: "定西市"},{id: "621122", name: "陇西县"}],
    showAreas: false,
  },

  chooseAreas: function() {
    this.setData({
      showAreas: true,
    });
  },

  /**
   * 城市选择回调
   * @author crl
   * @param  {Function} cb [description]
   * @return {[type]}
   */
  callAreas(cb) {
    if (cb.detail && cb.detail.type === 'success') {
      let val = cb.detail.value;
      console.log('选择了==>',val);
      this.setData({
        areasData: val
      });
    }
  },

  onLoad: function () {
  },
});
