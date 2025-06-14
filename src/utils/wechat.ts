// #ifdef H5
import wx from 'weixin-js-sdk'
// #endif
import { getWechatSdkConfig } from '@/app/api/system'
import { isWeixinBrowser } from '@/utils/common'

class Wechat {
    constructor() {
        // #ifdef H5
        // isWeixinBrowser() && this.init()
        // #endif
    }

    public init(callback: any = null) {
        getWechatSdkConfig({
            url: uni.getSystemInfoSync().platform == 'ios' ? uni.getStorageSync('initUrl') : location.href
        }).then((res: any) => {
            const { data } = res
            wx.config({
                debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
                appId: data.appId, // 必填，公众号的唯一标识
                timestamp: data.timestamp, // 必填，生成签名的时间戳
                nonceStr: data.nonceStr, // 必填，生成签名的随机串
                signature: data.signature,// 必填，签名
                jsApiList: ['chooseWXPay', 'updateAppMessageShareData', 'updateTimelineShareData', 'scanQRCode', 'getLocation'] // 必填，需要使用的JS接口列表
            });
            if (callback) callback();
        })
    }

    /**
     * 发起支付
     */
    public pay(options: WeixinJsSdk.ChooseWXPayOptions) {
        wx.ready(() => {
            wx.chooseWXPay(options)
        })
    }

    /**
     * 分享设置
     */
    public share(options: WeixinJsSdk.OnMenuShareAppMessageOptions) {
        wx.ready(() => {
            // 分享给朋友
            wx.updateAppMessageShareData(options)
            // 分享到朋友圈
            wx.updateTimelineShareData(options)
        })
    }

    /**
     * 扫一扫
     * @param {Object} callback
     */
    public scanQRCode(callback: any) {
        wx.ready(() => {
            wx.scanQRCode({
                needResult: 1,
                scanType: ["qrCode"],
                success: function (res) {
                    typeof callback == 'function' && callback(res);
                }
            });
        })
    }

    /**
     * 获取地理位置接口
     * @param {Object} callback
     */
    public getLocation(callback: any) {
        wx.ready(function () {
            wx.getLocation({
                type: 'gcj02',
                success: function (res) {
                    typeof callback == 'function' && callback(res);
                }
            });
        })
    }

    /**
     * 商家转账接口
     * @param {Object} options 转账参数
     */
    public transfer(options: any, callback: any) {
        // #ifdef MP
        if (wx.canIUse('requestMerchantTransfer')) {
            wx.requestMerchantTransfer({
                ...options,
                success: (res: any) => {
                    // console.log('success:', res);
                    typeof callback == 'function' && callback(res);
                },
                cancel: (res: any) => {
                    typeof callback == 'function' && callback(res);
                    // console.log('cancel:', res);
                },
                fail: (err: any) => {
                    typeof callback == 'function' && callback(err);
                },
            });
        } else {
            uni.showToast({
                title: '你的微信版本过低，请更新至最新版本。',
                icon: 'none'
            });
        }
        // #endif
        // #ifdef H5
        wx.ready(() => {
            wx.checkJsApi({
                jsApiList: ['requestMerchantTransfer'],
                success: function (res) {
                    if (res.checkResult['requestMerchantTransfer']) {
                        WeixinJSBridge.invoke('requestMerchantTransfer', options, (res: any) => {
                                typeof callback == 'function' && callback(res);
                            }
                        )
                    } else {
                        alert('你的微信版本过低，请更新至最新版本。');
                    }
                },
                fail: function (err) {
                    // console.log('err:', err);
                    typeof callback == 'function' && callback(err);
                },
                cancel: function (err) {
                    // console.log('cancel:', err);
                    typeof callback == 'function' && callback(err);
                }

            });
        })
        // #endif
    }
}

export default new Wechat()
