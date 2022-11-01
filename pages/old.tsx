import React from 'react'
import type { NextPage } from 'next'
import Head from 'next/head'
import { Wallet } from 'ethers'
import { Box, Button, ButtonGroup, Flex, Heading, useColorMode } from '@chakra-ui/react'
import { GoogleRecoveryWebReact } from '../src/recovery'

const GOOGLE_CLEINT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!;

const Home: NextPage = () => {
  // google user
  const { loading, importWalletFromGD, exportWalletToGD, inited } = GoogleRecoveryWebReact({ googleClientID: GOOGLE_CLEINT_ID })

  // wallets
  const [wallet, setWallet] = React.useState<Wallet | null>(null)

  // ui
  const { setColorMode } = useColorMode()

  const handleCreateNewWallet = () => {
    const newWallet = Wallet.createRandom()
    setWallet(newWallet)
  }

  const handleGDExport = async () => {
    try {
      if (!wallet) throw Error("You have no wallet")
      await exportWalletToGD(wallet)
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
  }

  const handleGDImport = async () => {
    try {
      const newWallet = await importWalletFromGD()
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
  }

  React.useCallback(() => {
    setColorMode('dark')
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Box backgroundColor='black' width={'100vw'} height={'100vh'}>
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

        <ButtonGroup gap='10' visibility={inited ? 'visible' : 'hidden'}>

          <Button onClick={handleCreateNewWallet} isLoading={loading} p='10'>
            Create new Wallet
          </Button>

          <Button onClick={handleGDExport} disabled={!wallet} isLoading={loading} p='10'>
            Export to Google Drive
          </Button>

          <Button onClick={handleGDImport} isLoading={loading} p='10'>
            Import from Google Drive
          </Button>
        </ButtonGroup>
        <ButtonGroup m={50} backgroundColor='black'>
        </ButtonGroup>
      </Flex>
    </Box>
  )
}

export default Home