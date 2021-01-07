import React from 'react'
import { Table, Menu, Dropdown, Button, Badge } from 'antd'
import IconFont from '../../../../utils/iconfont/iconfont'
import EditOrderPop from './EditOrderPop'
import { getCmdArr, toDecimal } from '../../../../utils/utilFunc'

const OrderSPanes = ({ data, type, onCloseOrder }) => {
  console.log("====OrderSPanes render", data)
  
  let { list, isFetching } = data
  const lastColMenu = (
    <Menu>
      <Menu.Item>
        <>对所有头寸进行平仓</>
      </Menu.Item>
      <Menu.Item>
        <>对盈利头寸进行平仓（净利）</>
      </Menu.Item>
      <Menu.Item>
        <>对亏损头寸进行平仓（净利）</>
      </Menu.Item>
    </Menu>
  )
  const isFoldRow = (key) => { // 非折叠行->0；折叠行->1
    return !isNaN(Number(key))
  }
  const getColumns = () => {
    return [
      {
        title: '品种',
        dataIndex: 'symbol',
        key: 'symbol',
        width: '23.02%',
        align: 'left',
        render: (symbol, item) => {
          return isFoldRow(item.key) ? 
            <span>{item.key}</span> :
            (
              <>
                {
                  item.ticket.length > 1 &&
                  <>
                    <span className="op-rkey-badge">{item.key}</span>
                    <Badge 
                      size="small"
                      count={item.ticket.length}
                      className="op-badge-ticket"
                    />
                  </>
                }
                {
                  item.ticket.length <= 1 &&
                  <>
                    <span className="op-rkey-ticket">{item.key}</span>
                    <span>{item.ticket[0]}</span>
                  </>
                }
              </>
            )
        }
      },
      {
        title: '手数',
        dataIndex: 'volume',
        key: 'volume',
        width: '7.94%',
        align: 'left'
      },
      {
        title: '方向',
        dataIndex: 'cmdForCh',
        key: 'cmdForCh',
        width: '7.46%',
        align: 'left'
      },
      {
        title: `${type == 0 ? "开仓" : "挂单"}价/即时价`,
        dataIndex: 'open_price',
        key: 'openPrice',
        width: '13.12%',
        align: 'left',
        render: (open_price, item) => {
          return (
            <>
              <span className="op-openprice">{open_price}</span>
              <span>{item.close_price}</span>
            </>
          ) 
        }
      },
      {
        title: '开仓时间',
        dataIndex: 'open_time',
        key: 'openTime',
        width: '12.06%',
        align: 'left'
      },
      {
        title: '止损',
        dataIndex: 'sl',
        key: 'sl',
        width: '7.09%',
        align: 'left',
        render: (sl, item) => {
          // console.log("====getColumns sl render")
          return (<>
            <span>{sl}</span>
            {
              (isFoldRow(item.key) || (!isFoldRow(item.key) && item.ticket.length <= 1))
              &&
              <EditOrderPop data={item} />
            }
          </>)
        }
      },
      {
        title: '止盈',
        dataIndex: 'tp',
        key: 'tp',
        width: '6.98%',
        align: 'left',
        render: (tp, item) => {
          return (<>
            <span>{tp}</span>
            {
              (isFoldRow(item.key) || (!isFoldRow(item.key) && item.ticket.length <= 1))
              &&
              <EditOrderPop data={item} />
            }
          </>)
        }
      },
      {
        title: '隔夜利息',
        dataIndex: 'storage',
        key: 'storage',
        width: '7.94%',
        align: 'left'
      },
      {
        title: '盈利',
        dataIndex: 'profit',
        key: 'profit',
        width: '7.95%',
        align: 'left',
        render: profit => {
          const className = profit > 0 ? 'color-up' : 'color-down'
          return <span className={className}>
            {profit > 0 ? '$ ' + profit : '-$ ' + Math.abs(profit)}
          </span>
        }
      },
      {
        title: (
          <Dropdown overlay={lastColMenu} placement="bottomRight">
            <Button type="default">
              <span>{type == 0 ? "平仓" : "取消"}</span>
              <IconFont type="iconDD" className="iconDD" />
            </Button>
          </Dropdown>
        ),
        dataIndex: 'closeOrder',
        key: 'closeOrder',
        className: 'op-cell-closeOrder',
        align: 'center',
        render: (closeOrder,item) => {
          return (
            ((!isFoldRow(item.key) && item.ticket.length <= 1) || isFoldRow(item.key))
            &&
            <Button 
              type="default"
              className="op-btn-close"
              onClick={() => onCloseOrder(item)}
            >
              <IconFont 
                type="iconClose" 
                className="op-icon-close"
              />
            </Button>
          )
        }
      }
    ]
  }
  const getHistoryCol = () => [
    {
      title: '品种',
      dataIndex: 'symbol',
      key: 'symbol',
      width: '8.4%'
    },
    {
      title: '订单',
      dataIndex: 'ticket',
      key: 'ticket',
      width: '10%'
    },
    {
      title: '手数',
      dataIndex: 'volume',
      key: 'volume',
      width: '7.94%'
    },
    {
      title: '方向',
      dataIndex: 'cmdForCh',
      key: 'cmdForCh',
      width: '9.06%'
    },
    {
      title: '开仓价/平仓价',
      dataIndex: 'open_price',
      key: 'openPrice',
      width: '18.14%',
      render: (open_price, item) => {
        return (
          <>
            <span className="op-openprice">{open_price}</span>
            <span>{item.close_price}</span>
          </>
        ) 
      }
    },
    {
      title: '开仓时间',
      dataIndex: 'open_time',
      key: 'openTime',
      width: '15.06%'
    },
    {
      title: '平仓时间',
      dataIndex: 'close_time',
      key: 'openTime',
      width: '14.06%'
    },
    {
      title: '隔夜利息',
      dataIndex: 'storage',
      key: 'storage',
      width: '6.94%',
      align: 'center'
    },
    {
      title: '盈利',
      dataIndex: 'profit',
      key: 'profit',
      align: 'center'
    }
  ]
  const handleList = (response) => {
    if(response.length) {
      const cmdArr = getCmdArr()
      let data = [], dataObj = {}
      for(var p of response) {
        p.key = p.ticket
        p.cmdForCh = cmdArr[p.cmd]
        p.profit = Number(toDecimal(p.profit, 2))
        if(!dataObj[p.symbol]) {
          dataObj[p.symbol] = new Array(p)
        } else {
          dataObj[p.symbol].push(p)
        }
      }
      for(var symbol in dataObj) {
        const isMoreThan1 = dataObj[symbol].length > 1
        data.push({
          key: symbol,
          symbol: symbol,
          ticket: dataObj[symbol].map(item => `${item.ticket}`),
          volume: toDecimal(dataObj[symbol].reduce((prev, currItem) => prev + currItem.volume,0), 2),
          cmd: isMoreThan1 ? '' : dataObj[symbol][0].cmd,
          cmdForCh: isMoreThan1 ? '' : dataObj[symbol][0].cmdForCh,
          open_price: isMoreThan1 ? '' : dataObj[symbol][0].open_price,
          close_price: isMoreThan1 ? '' : dataObj[symbol][0].close_price,  // 即时价需实时更新
          open_time: isMoreThan1 ? '' : dataObj[symbol][0].open_time,
          sl: isMoreThan1 ? '' : dataObj[symbol][0].sl,
          tp: isMoreThan1 ? '' : dataObj[symbol][0].tp,
          storage: toDecimal(dataObj[symbol].reduce((prev, currItem) => prev + currItem.storage,0), 2),
          profit: toDecimal(dataObj[symbol].reduce((prev, currItem) => prev + currItem.profit,0), 2),
          commission: toDecimal(dataObj[symbol].reduce((prev, currItem) => prev + currItem.commission,0), 2),
          children: isMoreThan1 ? dataObj[symbol] : []
        })
      }
      return data
    }
  }
  
  return (
    <Table
      dataSource={handleList(list)}
      loading={isFetching}
      columns={type < 2 ? getColumns() : getHistoryCol()}
      pagination={false}
      expandable={{
        // rowExpandable: (record) => {
        //   console.log(record)
        //   return false
        // }
        // expandRowByClick:true,
        // expandIconAsCell:false,
        // expandIconColumnIndex:-1,  // 自定义展开按钮的列顺序，-1 时不展示
      }}
      // onRow={record => {
      //   console.log("===onRow click:", record)
      //   return {
      //     onClick: (e) => {
      //       e.stopPropagation()
      //     }
      //   }
      // }}
      scroll={{ y: 'calc(100% - 40px)'}}
    />
  )
}

const areEqual = (prevProps, nextProps) => {
  const prevData = prevProps.data,
        nextData = nextProps.data
  console.log("====OSP areEqual", prevData.list, nextData.list,JSON.stringify(prevData.list) === JSON.stringify(nextData.list))
  if(JSON.stringify(prevData.list) === JSON.stringify(nextData.list) && prevData.isFetching === nextData.isFetching) {
    return true
  } else {
    return false
  }
}

export default OrderSPanes