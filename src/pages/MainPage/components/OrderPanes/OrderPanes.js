import { Modal, InputNumber } from 'antd'
import CardTabs from '../../../../components/CardTabs/CardTabs'
import OrderSPanes from './OrderSPanes'
import styles from './OrderPanes.module.scss'

import { useState, useEffect, useRef } from 'react'
import { connect } from 'react-redux';
import { 
  getPositions, 
  getHistories, 
  closeOrder 
} from '../../MainAction' 
import { setAccountInfo } from '../../MainAction'
import { openNotificationWithIcon, toDecimal, isBuy } from '../../../../utils/utilFunc'
import IconFont from '../../../../utils/iconfont/iconfont'
import { FormattedMessage, useIntl } from 'react-intl'

const OrderPanes = ({ socket, accountInfo, listArr, quoteList, dispatch}) => {
  // console.log("====OrderPanes", quoteList)
  const { confirm } = Modal
  const { info } = accountInfo
  const [activeKey, setActiveKey] = useState("0")
  const volumeRef = useRef(null)
  const intl = useIntl()

  const _getPositions = (activeKey) => {
    return dispatch(getPositions()).then(res => {
      const { position,order } = res.value
      dispatch(setAccountInfo({
        profit: Number(activeKey) === 0 ? 
          position.reduce((prev, item) => prev + Number(item.profit), 0) :
          order.reduce((prev, item) => prev + Number(item.profit), 0)
      }))
    })
  }
  const _getHistories = (from = 0, to = new Date().getTime()) => {
    return dispatch(getHistories({from, to})).then(res => {
      dispatch(setAccountInfo({ 
        profit: res.value.reduce((prev, item) => prev + Number(item.profit), 0)
      }))
    })
  }
  const onChange = activeKey => {
    setActiveKey(activeKey)  // 不要依赖于setActiveKey去重新获取列表值
    if(!listArr[activeKey].list.length && !listArr[activeKey].isFetching) {
      activeKey < 2 && _getPositions(activeKey)
      activeKey >= 2 && _getHistories()
    } else {// if(activeKey === "2") {
      const totalProfit = listArr[activeKey].list.reduce((prev, item) => prev + Number(item.profit), 0)
      dispatch(setAccountInfo({ profit: totalProfit }))
    }
  }
  const onQuoteChange = () => {
    const ospData = listArr[activeKey].list  // 引用类型，修改ospData就是在修改listArr[activeKey].list
    for(let oItem of ospData) {
      for(let qItem of quoteList) {
        if(!qItem.trans_price_ask) continue  // 没有返回该值时不更新该订单即时价和盈利数据
        // 加上bid的判断是保证当前货币已有报价数据，否则就保持原数据不变
        if(qItem.symbol === oItem.symbol && qItem.bid) {
          oItem.digits = qItem.digits
          let flag
          // 当quoteList中尚未接入报价数据时需保持原有即时价格
          if(isBuy(oItem.cmdForCh)) {  // 多单 buy
            oItem.close_price = qItem.bid
            flag = 1
          } else {  // 空单 sell
            oItem.close_price = qItem.ask
            flag = -1
          }
          if(!Number(activeKey)) {
            oItem.profit = ((oItem.close_price - oItem.open_price) * oItem.volume * qItem.size * qItem.trans_price_ask * flag).toFixed(2)
          }
          oItem.close_price = toDecimal(oItem.close_price, qItem.digits)
        }
      }
    }
    // 更新store中用户账户信息数据
    if(!Number(activeKey) && Object.keys(info).length) {
      // 浮动盈亏，即盈利
      info.profit = ospData.reduce((prev, item) => prev + Number(item.profit),0)
      // 净值
      info.equity = info.balance + info.profit
      // 可用保证金
      info.freeMargin = info.equity - info.margin
      // 保证金比例
      info.marginLevel = info.equity - info.freeMargin ? Math.floor(info.equity / (info.equity - info.freeMargin) * 10000) / 100 : 0
      // console.log("info", info,ospData)
      dispatch(setAccountInfo(info))
    }
  }
  const onCloseOrder = (tickets, volume = 0) => {
    const ticketsStr = Array.isArray(tickets) ? tickets.join(",") : tickets
    const lots = volume // volumeRef.current ? volumeRef.current.input.value : 0.00
    return dispatch(closeOrder({
      lots, ticket: ticketsStr, activeKey
    })).then(res => {
      const { ticket } = res.value
      openNotificationWithIcon({
        type: 'success', 
        msg: (
          Number(activeKey) === 0 ?
          intl.formatMessage({ id: "order.noti.closePositionSuccess", defaultMessage: "平仓成功" }) : 
          intl.formatMessage({ id: "order.noti.closeOrderSuccess", defaultMessage: "删除挂单成功" })
        ),
        desc: intl.formatMessage({ 
          id: "order.noti.closeDesc", 
          defaultMessage: "被操作的订单编号为： {ticketsStr}"
        }, {
          ticketsStr: ticket.join(",")
        })
      })
      // 重新获取持仓/挂单列表
      _getPositions(activeKey)
    }).catch(err => {
      openNotificationWithIcon({
        type: 'error', 
        msg: (
          Number(activeKey) === 0 ?
          intl.formatMessage({ id: "order.noti.closePositionError", defaultMessage: "平仓失败" }) : 
          intl.formatMessage({ id: "order.noti.closeOrderError", defaultMessage: "删除挂单失败" })
        ), 
        desc: err
      })
    })
  }
  const onShowConfirmForSingle = (item) => {
    confirm({
      title: (
        Number(activeKey) === 0 ? 
        intl.formatMessage({
          id: "order.confirm.closePositionForSingle",
          defaultMessage: "确定平仓？"
        })
        :
        intl.formatMessage({
          id: "order.confirm.closeOrderForSingle",
          defaultMessage: "确定删除该挂单？"
        })
      ),
      icon: <IconFont type="iconWarning" />,
      // 部分平仓（待接口完善）
      // content: (  
      //   <>
      //     <span>请选择操作手数：</span>
      //     <InputNumber
      //       ref={volumeRef}
      //       min={0.01}
      //       max={item.volume}
      //       step={0.01}
      //       defaultValue={item.volume}
      //       size="small"
      //     />
      //   </>
      // ),
      className: "op-confirm-closeOrder",
      okText: intl.formatMessage({ id: "common.okText", defaultMessage:"确定" }),
      cancelText: intl.formatMessage({ id: "common.cancelText", defaultMessage: "取消" }),
      getContainer: () => document.querySelector(".main-middle-x .ant-tabs-card"),
      onOk: () => {
        return onCloseOrder(item.ticket, item.volume)
      },
      onCancel: () => {
        console.log("cancel")
      }
    })
  }
  const onShowConfirmForAll = (tickets) => {
    confirm({
      title: (
        Number(activeKey) === 0 ?
        intl.formatMessage({ 
          id: "order.confirm.closePositionForAll", 
          defaultMessage: "确定平仓下列订单号的订单？"
        }) : 
        intl.formatMessage({
          id: "order.confirm.closeOrderForAll",
          defaultMessage: "确定删除下列订单号的订单？"
        })
      ),
      icon: <IconFont type="iconWarning" />,
      content: (
        <p>{tickets.join(",")}</p>
      ),
      className: "op-confirm-closeOrder",
      okText: intl.formatMessage({ id: "common.okText", defaultMessage: "確定" }),
      cancelText: intl.formatMessage({ id: "common.cancelText", defaultMessage: "取消" }),
      getContainer: () => document.querySelector(".main-middle-x .ant-tabs-card"),
      onOk: () => onCloseOrder(tickets),
      onCancel: () => {
        console.log("cancel")
      }
    })
  }

  useEffect(() => {
    if(!listArr[activeKey].list.length && !listArr[activeKey].isFetching) {
      activeKey < 2 && _getPositions(activeKey)
      activeKey >= 2 && _getHistories()
    }
  }, [])

  useEffect(() => {
    if(Object.keys(socket).length && listArr[0].list && listArr[0].list.length) {
      socket.on("order", () => _getPositions(activeKey))
    }
  }, [JSON.stringify(socket), JSON.stringify(listArr[0])])
  useEffect(() => {
    if(quoteList && quoteList.length) {
      onQuoteChange()
    }
  }, [JSON.stringify(quoteList)])

  return (
    <CardTabs
      className={styles['order-x']}
      initialPanes={[
        { title: (
          <FormattedMessage
            id="order.tabName.position"
            defaultMessage="持仓单"
          />
        ), content: 
          <OrderSPanes 
            data={listArr[0]}
            type="0"
            onShowConfirmForSingle={onShowConfirmForSingle}
            onShowConfirmForAll={onShowConfirmForAll}
          />,
          key: '0'
        },
        { title: (
          <FormattedMessage
            id="order.tabName.order"
            defaultMessage="挂单交易"
          />
        ), content: 
          <OrderSPanes 
            data={listArr[1]}
            type="1" 
            onShowConfirmForSingle={onShowConfirmForSingle}
            onShowConfirmForAll={onShowConfirmForAll}
          />, key: '1' },
        { title: (
          <FormattedMessage
            id="order.tabName.history"
            defaultMessage="历史订单"
          />
        ), content: <OrderSPanes data={listArr[2]} type="2" />, key: '2' }
      ]}
      activeKey={activeKey}
      onChange={onChange}
    ></CardTabs>
  )
}

export default connect(
  state => {
    const {
      initSocket,
      positionOrder,
      history = {},
      accountInfo,
      symbolList
    } = state.MainReducer
    const { position, order } = positionOrder
    let pSymbols = position.list.map(item => item.symbol),
        oSymbols = order.list.map(item => item.symbol)
    const symbolsArr = [...new Set(pSymbols.concat(oSymbols))]

    return {
      socket: initSocket,
      accountInfo,
      listArr: [
        position, order, history
      ],
      quoteList: symbolList.list && symbolList.list.filter(item => symbolsArr.includes(item.symbol))
    }
  }
  // dispatch => {
  //   return {
  //     getPositions: () => {
  //       return dispatch(getPositions()).then(res => {
  //         console.log("=====456", res)
  //         const { position,order } = res.value
  //         dispatch(setAccountInfo({
  //           profit: activeKey == 0 ? 
  //             position.reduce((prev, item) => prev + Number(item.profit), 0) :
  //             order.reduce((prev, item) => prev + Number(item.profit), 0)
  //         }))
  //       })
  //     }
  //   }
  // }
)(OrderPanes)