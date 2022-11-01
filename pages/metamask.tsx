import React from 'react'
import type { NextPage } from 'next'
import Head from 'next/head'
import { Wallet } from 'ethers'
import { Box, Button, ButtonGroup, Flex, Heading, useColorMode } from '@chakra-ui/react'
import { MetamaskRecovery, MetamaskRecoveryMechanismOption } from '../src/recovery'

const metamaskRecoveryMechanismOption: MetamaskRecoveryMechanismOption = {}


const Home: NextPage = () => {
  // const recoveryMechanism = new GoogleDriveWalletRecovery(googleRecoveryMechanismOptions)
  // google user
  // const { loading, importWalletFromGD, exportWalletToGD, inited } = GoogleDriveWalletRecovery({ googleClientID: GOOGLE_CLEINT_ID })
  const [inited, setInited] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [recoveryMechanism, setRecoveryMechanism] = React.useState<MetamaskRecovery>()

  // wallets
  const [wallet, setWallet] = React.useState<Wallet | null>(null)

  // ui
  const { setColorMode } = useColorMode()

  const handleCreateNewWallet = () => {
    const newWallet = Wallet.createRandom()
    setWallet(newWallet)
  }

  const handleExport = async () => {
    if (loading) throw Error("Loading import or export");
    if (!recoveryMechanism) throw new Error("Recovery is not defined.")
    setLoading(true);

    try {
      if (!wallet) throw Error("You have no wallet")
      await recoveryMechanism.setupRecovery(wallet)
      console.log("Export successful")
    }
    catch (err) {
      let errorMessage = 'unknown';
      if (typeof err === "string") {
        errorMessage = err.toUpperCase()
      } else if (err instanceof Error) {
        errorMessage = err.message
      }
      console.log("Export Error Message:", errorMessage)
    }
    setLoading(false);
  }

  const handleImport = async () => {
    if (loading) throw Error("Loading import or export");
    if (!recoveryMechanism) throw new Error("Recovery is not defined.")
    setLoading(true);

    try {
      const newWallet = await recoveryMechanism.initiateRecovery(3)
      setWallet(newWallet!)
      console.log("Import successful")
    }
    catch (err) {
      let errorMessage = 'unknown';
      if (typeof err === "string") {
        errorMessage = err.toUpperCase()
      } else if (err instanceof Error) {
        errorMessage = err.message
      }
      console.log("Import Error Message:", errorMessage)
    }
    setLoading(false);
  }

  React.useEffect(() => {
    recoveryMechanism?.recoveryReadyPromise().then(() => {
      setInited(true);
    })
  }, [recoveryMechanism])

  React.useEffect(() => {
    setColorMode('dark')
    const newRecoveryMechanism = new MetamaskRecovery(metamaskRecoveryMechanismOption)
    setRecoveryMechanism(newRecoveryMechanism)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Box p='10' backgroundColor='black' width={'100vw'} height={'100vh'}>
      <Head>
        <title>Google Drive Wallet Auth</title>
        <meta name="description" content="Google drive wallet recovery" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Flex flexDir='column' textAlign='center' alignItems='center'>

        {wallet ?
          <Heading >
            Your address is {wallet.address}
          </Heading> :

          <Heading>
            You don&apos;t have a wallet yet
          </Heading>
        }

        <ButtonGroup mt='10' gap='10' visibility={inited ? 'visible' : 'hidden'}>

          <Button onClick={handleCreateNewWallet} isLoading={loading} p='10'>
            Create new Wallet
          </Button>

          <Button onClick={handleExport} disabled={!wallet} isLoading={loading} p='10'>
            setupRecovery
          </Button>

          <Button onClick={handleImport} isLoading={loading} p='10'>
            initiateRecovery
          </Button>
        </ButtonGroup>
        <ButtonGroup m={50} backgroundColor='black'>
        </ButtonGroup>
      </Flex>
    </Box>
  )
}

export default Home
