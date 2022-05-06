import { useContext, useState } from "react"
import { MainContext } from "../context"
import BigNumber from "bignumber.js"

export default function Home() {
  const [file, setFile] = useState()
  const [image, setImage] = useState()
  const [URI, setURI] = useState()
  const [amount, setAmount] = useState()

  const {
        initialize, fetchBalance, balance, bundlrInstance
  } = useContext(MainContext)

  async function initializeBundlr(){
    initialize()
  }

  async function fundWallet() {
    if (!amount) return
    const amountParsed = parseInput(amount)
    let response = await bundlrInstance.fund(amountParsed)
    console.log('Wallet funded: ', response)
    fetchBalance()
  }

  function parseInput(input) {
    const conv = new BigNumber(input).multipliedBy(bundlrInstance.currencyConfig.base[1])
    if (conv.isLessThan(1)) {
      console.log('error: value to small')
      return 
    } else {
      return conv
    }
  }

  async function uploadFile() {
    let tx = await bundlrInstance.upload(file, [{ name: "Content-Type", value: image/png}])
    console.log('tx: ', tx)
    setURI(`https://arweave.net/${tx.data.id}`)
  }

  function onFileChange(e) {
    const file = e.target.files[0]
    if (file) {
      const image = URL.createObjectURL(file)
      setImage(image)
      let reader = new FileReader()
      reader.onload = function () {
        if (reader.result) {
          setFile(Buffer.from(reader.result))
        }
      }
      reader.readAsArrayBuffer(file)
    }
  }

  return (
    <div style={containerStyle}>
      {
        !balance && <button onClick={initializeBundlr}>initialize Bundlr</button>
      }
      {
        balance && (
          <div>
            <h3>Balance: {balance}</h3>
            <div style={{padding: '30px 0px'}}>
              <input
                placeholder='Amount to fund wallet'
                onChange={e => setAmount(e.target.value)}
              />
              <button onClick={fundWallet}>Fund Wallet</button>
            </div>
            <input type="file" onChange={onFileChange} />
            <button onClick={uploadFile}></button>
            {
              image && <img src={image} style={{ width: '500px' }} />
            }
            {
              URI && <a href={URI}>{URI}</a>
            }
          </div>
        )
      }
    </div>
  )
}

const containerStyle = {
  padding: '100px 20px'
}
