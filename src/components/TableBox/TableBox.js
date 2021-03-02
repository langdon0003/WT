
import { Table } from 'antd'
import IconFont from '../../utils/iconfont/iconfont'
import QuoteTr from '../../pages/MainPage/components/QuotePanes/QuoteTr'
import styles from './TableBox.module.scss'
import { useState,useEffect } from 'react'
import SymbolInfoModal from '../SymbolInfoModal/SymbolInfoModal'

function TableBox (props) {
  const { data, addToKLine, isExpandAll } = props  // isLogin
  const [expandedRows, setExpandedRows] = useState()
  const [visible, setVisible] = useState(false)
  const [symbol, setSymbol] = useState(null)

  const renderContent = (val, row, index, type) => {
    // console.log("====renderContent", val, row, index)
    const obj = {
      children: val || '---',
      props: {}
    }
    if(expandedRows && expandedRows.includes(row.symbol)) {
      obj.props.colSpan = type === 'ask' ? 3 : 0
      obj.children = (
        <>
          <div className="qsp-symbol-operate">
            <>
              <IconFont 
                type="iconInfo"
                className="icon-info"
                onClick={(e) => {
                  e.stopPropagation()
                  setSymbol(row.symbol)
                  setVisible(true)
                  // getSIMJSX(row.symbol)
                }}
              />
              {/* <SymbolInfoModal
                symbol={row.symbol}
                visible={visible}
                onCancel={() => setVisible(false) }
              /> */}
            </>
            <IconFont 
              type="iconKLine"
              className="icon-kline"
              onClick={(e) => 
                addToKLine(e,row.symbol, row.bid.split(".")[1].length)
              }
            />
            {/* <IconFont 
              type="iconFavorite"
              className="icon-favorite"
              onClick={addToFavorite}
            /> */}
          </div>
        </>
      )
    }
    return obj
  }
  const getColumns = () => [
    {
      title: '品种',
      dataIndex: 'symbol',
      key: 'symbol',
      width: '40.68%',
      render: symbol => (
        <>
          <IconFont type="iconDown" className="iconDown" />
          <span style={{ marginLeft: '8px' }}>{symbol}</span>
        </>
      )
    },
    {
      title: '调查',
      dataIndex: 'spread',
      key: 'spread',
      width: '19.5%',
      align: 'center',
      textWrap: 'word-break',
      ellipsis: true,
      render: (...args) => renderContent(...args, 'spread')
    },
    {
      title: '卖',
      dataIndex: 'bid',
      key: 'bid',
      align: 'center',
      render: (...args) => renderContent(...args, 'bid')
    },
    {
      title: '买',
      dataIndex: 'ask',
      key: 'ask',
      align: 'center',
      render: (...args) => renderContent(...args, 'ask')
    }
  ]

  useEffect(() => {
    const changeExpandedRowKeys = () => {
      const _expandedRows = isExpandAll ? data.map(item => item.key) : []
      return _expandedRows
    }
    setExpandedRows(changeExpandedRowKeys())
  }, [isExpandAll])
  

  return (
    <>
      <Table
        className={styles['table-x']}
        columns={getColumns()}
        dataSource={data}
        pagination={false}
        sticky={true}
        rowClassName={(record, index) => {
          let className = ''
          className += record.isUp ? 'quote-up ' : 'quote-down '
          className += index % 2 ? '' : 'dark-row'
          return className
        }}
        expandable={{
          expandRowByClick: false,
          expandIconAsCell: false,
          expandIconColumnIndex: -1,
          expandedRowKeys: expandedRows,  // 展开的行
          expandedRowClassName: (record, index) => 'quote-expand-tr ' + (record.isUp ? 'quote-up' : 'quote-down'),
          expandedRowRender: record => <QuoteTr data={record} />,
          // onExpandedRowsChange: (expandedRows) => {
          //   console.log(expandedRows)
          //   setExpandedRows(expandedRows)
          // }
        }}
        onRow={record => {
          return {
            onClick: event => {
              console.log(event, record, expandedRows, [...new Set(expandedRows)])
              const isExpanded = expandedRows.includes(record.symbol)
              if(isExpanded) {
                setSymbol(null)
                setExpandedRows(expandedRows.filter(item => item !== record.symbol))
              } else {
                expandedRows.push(record.symbol)
                setExpandedRows([...new Set(expandedRows)])
              }
            },
            onDoubleClick: event => {
              // console.log(record, event, addToKLine)
              addToKLine(event, record.symbol, record.digits)
            }
          }
        }}
      />
      { visible && symbol &&
        <SymbolInfoModal
          symbol={symbol}
          visible={visible}
          onCancel={() => setVisible(false) }
        />
      }
    </>
  )
}

export default TableBox