import React, { useEffect } from 'react'
import type { NextPage } from 'next'
import Head from 'next/head'
import { Wallet } from 'ethers'
import { Box, Button, ButtonGroup, Flex, Heading } from '@chakra-ui/react'
import { useSession, signIn, signOut } from 'next-auth/client'


const Home: NextPage = () => {

  const [session] = useSession()

  const [wallet, setWallet] = React.useState<Wallet | null>(null)
  const [loading, setLoading] = React.useState(false)


  const handleCreateNewWallet = () => {
    const newWallet = Wallet.createRandom()
    setWallet(newWallet)
  }

  const handleGDExport = async () => {
    setLoading(true)
    try {
      // todo

    }
    catch {
    }

    signOut()
    setLoading(false)
  }

  const handleGDImport = async () => {
    setLoading(true)
    try {
      // todo

    }
    catch {

    }
    signOut()
    setLoading(false)
  }

  useEffect(() => {

  }, [])

  return (
    <Box>
      <Head>
        <title>Google Drive Wallet Auth</title>
        <meta name="description" content="Google drive wallet recovery" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {
        session ? <p>{session.user?.email}</p> : null
      }

      <Flex flexDir='column' textAlign='center' alignItems='center'>

        {wallet ?
          <Heading>
            Your address is {wallet.address}
          </Heading> :

          <Heading>
            You don&apos;t have a wallet yet
          </Heading>
        }

        <ButtonGroup gap='10'>
          <Button onClick={handleCreateNewWallet} disabled={loading} p='10'>
            Create new Wallet
          </Button>

          <Button onClick={handleGDExport} disabled={loading || !wallet} p='10'>
            Export to Google Drive
          </Button>

          <Button onClick={handleGDImport} disabled={loading} p='10'>
            Import from Google Drive
          </Button>
        </ButtonGroup>

      </Flex>
    </Box>
  )
}


// export async function get() {
// const client_id = credentials.web.client_id;
// const client_secret = credentials.web.client_secret;
// const redirect_uris = credentials.web.redirect_uris;
// const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

// const SCOPE = ['https://www.googleapis.com/auth/drive.metadata.readonly https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/drive.file']

// const emojis = await getEmojiList();
// return {
//   props: {
//     emojis: emojis.slice(1, emojis.length), // remove sheet header
//   },
//   revalidate: 1, // In seconds
// };
// }

export default Home
