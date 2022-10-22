import React from 'react'
import type { NextPage } from 'next'
import Head from 'next/head'
import { Wallet } from 'ethers'
import { Box, Button, ButtonGroup, Flex, Heading } from '@chakra-ui/react'

import { loadGoogleScript } from '../src/utils'
import { uploadFileToDrive, Metadata } from '../src/google/utils'

const GOOGLE_CLEINT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
const SCOPES = ['https://www.googleapis.com/auth/drive']
const ZERO_WALLET_FOLDER_NAME = '.zero-wallet'
const ZERO_WALLET_FILE_NAME = 'key'

const Home: NextPage = () => {
  // google user
  const [tokenClient, setTokenClient] = React.useState<any>()
  const [gapiInited, setGapiInited] = React.useState(false)
  const [gisInited, setGisInited] = React.useState(false)
  const [loading, setLoading] = React.useState(false)

  // wallets
  const [wallet, setWallet] = React.useState<Wallet | null>(null)

  // ui
  const googleButton = React.useRef(null);

  function gapiInit() {
    gapi.client.init({})
      .then(function () {  // Load the Calendar API discovery document.
        // @ts-ignore
        gapi.client.load('https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest');
        gapi.client.load('https://www.googleapis.com/discovery/v1/apis/drive/v3/rest');
        // gapi.client.load("calendar", "v3");
        // gapiInited = true;
        setGapiInited(true)
      });
  }

  const handleCreateNewWallet = () => {
    const newWallet = Wallet.createRandom()
    setWallet(newWallet)
  }

  const handleGDImport = async () => {

    setLoading(true)

    tokenClient.callback = async (resp: any) => {
      if (resp.error !== undefined) {
        throw (resp);
      }

      try {
        const folderQuerySelector: string = `mimeType=\'application/vnd.google-apps.folder\' and name=\'${ZERO_WALLET_FOLDER_NAME}\' and \'root\' in parents`

        const folderQueryResponse = await gapi.client.drive.files.list({ q: folderQuerySelector, spaces: 'drive' })

        if (!folderQueryResponse.result.files) throw Error("Import failed")

        const zeroWalletFolderId = folderQueryResponse.result.files[0].id!
        const keyFileQuerySelector: string = `mimeType!=\'application/vnd.google-apps.folder\' and \'${zeroWalletFolderId}\' in parents and name=\'${ZERO_WALLET_FILE_NAME}\' and trashed = false`
        const keyFileQueryResponse = await gapi.client.drive.files.list({ q: keyFileQuerySelector, spaces: 'drive' })

        if (keyFileQueryResponse.result.files?.length === 0) throw Error("Import failed. No key files found.")
        if (keyFileQueryResponse.result.files?.length !== 1) throw Error("Import failed. Found multiple key files.")

        const keyFileId = keyFileQueryResponse.result.files[0].id!
        // GET file content
        const keyFileContent = await gapi.client.drive.files.get({
          fileId: keyFileId,
          alt: 'media',
        })

        try {
          const newWallet = new Wallet(keyFileContent.body)
          setWallet(newWallet)
          console.log("Import successful")
        }
        catch {
          throw Error("Content is not a valid private key")
        }
      }
      catch (e) {
        let errorMessage;
        if (typeof e === "string") {
          errorMessage = e
        } else if (e instanceof Error) {
          errorMessage = e.message // works, `e` narrowed to Error
        }
        console.error(errorMessage)
      }
      setLoading(false)
    }

    try {
      // Conditionally ask users to select the Google Account they'd like to use,
      // and explicitly obtain their consent to fetch their Calendar.
      // NOTE: To request an access token a user gesture is necessary.
      if (gapi.client.getToken() === null) {
        // Prompt the user to select an Google Account and asked for consent to share their data
        // when establishing a new session.
        tokenClient.requestAccessToken({ prompt: 'consent' });
      } else {
        // Skip display of account chooser and consent dialog for an existing session.
        tokenClient.requestAccessToken({ prompt: '' });
      }
    }
    catch {
      setLoading(false)
    }

  }

  const handleGDExport = () => {
    setLoading(true)
    tokenClient.callback = async (resp: any) => {
      if (resp.error !== undefined) {
        throw (resp);
      }

      try {
        // GIS has automatically updated gapi.client with the newly issued access token.
        // console.log('gapi.client access token: ' + JSON.stringify(gapi.client.getToken()));

        // Creating .zero-wallet folder or getting it from drive
        let zeroWalletFolderId: string;
        const folderQuerySelector: string = `mimeType=\'application/vnd.google-apps.folder\' and name=\'${ZERO_WALLET_FOLDER_NAME}\' and \'root\' in parents`

        const folderQueryResponse = await gapi.client.drive.files.list({ q: folderQuerySelector, spaces: 'drive' })

        // @TODO handle if there are multiple folders with the name of ZERO_WALLET_FOLDER_NAME.
        // @TODO A customized ID can be used to identify the correct folder.
        // @TODO Maybe remove all ZERO_WALLET_FOLDER_NAME folders
        if (folderQueryResponse.result.files?.length) {
          zeroWalletFolderId = folderQueryResponse.result.files[0].id!

          // Removing the old ZERO_WALLET_FILE_NAME file.
          // @TODO read the last key file id and add a new file with id + 1 
          const keyFileQuerySelector: string = `mimeType!=\'application/vnd.google-apps.folder\' and \'${zeroWalletFolderId}\' in parents and name=\'${ZERO_WALLET_FILE_NAME}\' and trashed = false`
          const keyFileQueryResponse = await gapi.client.drive.files.list({ q: keyFileQuerySelector, spaces: 'drive' })

          // removing all key files
          if (keyFileQueryResponse.result.files)
            await Promise.all(keyFileQueryResponse.result.files.map((elem) => {
              const oldKeyFileId = elem.id!
              return gapi.client.drive.files.delete({ fileId: oldKeyFileId })
            }))
        }
        else {
          const folderMetadata: gapi.client.drive.File = {
            name: ZERO_WALLET_FOLDER_NAME,
            mimeType: 'application/vnd.google-apps.folder',
          };

          const newZeroWalletFolder = await gapi.client.drive.files.create({ resource: folderMetadata })
          zeroWalletFolderId = newZeroWalletFolder.result.id!
        }

        const keyFileMetadata: Metadata = {
          name: ZERO_WALLET_FILE_NAME,
          parents: [zeroWalletFolderId],
          mimeType: "application/octet-stream",
        };

        await uploadFileToDrive(keyFileMetadata, wallet!.privateKey)
        console.log("Export successful!")
      }
      catch (e) {
        let errorMessage;
        if (typeof e === "string") {
          errorMessage = e
        } else if (e instanceof Error) {
          errorMessage = e.message // works, `e` narrowed to Error
        }
        console.error(errorMessage)
        console.error(e)
      }
      setLoading(false)
    }
    try {
      // Conditionally ask users to select the Google Account they'd like to use,
      // and explicitly obtain their consent to fetch their Calendar.
      // NOTE: To request an access token a user gesture is necessary.
      if (gapi.client.getToken() === null) {
        // Prompt the user to select an Google Account and asked for consent to share their data
        // when establishing a new session.
        tokenClient.requestAccessToken({ prompt: 'consent' });
      } else {
        // Skip display of account chooser and consent dialog for an existing session.
        tokenClient.requestAccessToken({ prompt: '' });
      }
    }
    catch {
      setLoading(false)
    }
  }

  function revokeToken() {
    let cred = gapi.client.getToken();
    if (cred !== null) {
      google.accounts.oauth2.revoke(cred.access_token, () => { console.log('Revoked: ' + cred.access_token) });
      gapi.client.setToken(null);
    }
  }

  React.useEffect(() => {
    // Loading GAPI and GSI

    const srcGsi = 'https://accounts.google.com/gsi/client'
    const srcGapi = 'https://apis.google.com/js/api.js'

    loadGoogleScript(srcGsi)
      .then(() => {
        /*global google*/
        // const google = window.google!
        // console.log(google)
        // google.accounts.id.initialize({
        //   client_id: gclientId,
        //   callback: handleCredentialResponse,
        // })
        // google.accounts.id.renderButton(
        //   googleButton.current,
        //   { theme: 'filled_black', size: 'large' }
        // )
        setTokenClient(google.accounts.oauth2.initTokenClient({
          client_id: GOOGLE_CLEINT_ID!,
          scope: SCOPES.join(' '),
          callback: () => { },  // defined at request time
        }));
        setGisInited(true)
      })
      .catch(console.error)

    loadGoogleScript(srcGapi)
      .then(() => {
        /*global google*/
        // const google = window.google!
        // console.log(google)
        // google.accounts.id.initialize({
        //   client_id: gclientId,
        //   callback: handleCredentialResponse,
        // })
        // google.accounts.id.renderButton(
        //   googleButton.current,
        //   { theme: 'filled_black', size: 'large' }
        // )
        gapi.load('client', gapiInit)
      })
      .catch(console.error)
  }, [])

  return (
    <Box>
      <Head>
        <title>Google Drive Wallet Auth</title>
        <meta name="description" content="Google drive wallet recovery" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Flex flexDir='column' textAlign='center' alignItems='center'>

        {wallet ?
          <Heading>
            Your address is {wallet.address}
          </Heading> :

          <Heading>
            You don&apos;t have a wallet yet
          </Heading>
        }

        <ButtonGroup gap='10' hidden={gapiInited && gisInited}>

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
        <ButtonGroup m={50} ref={googleButton} backgroundColor='black'>
        </ButtonGroup>

      </Flex>
    </Box>
  )
}

export default Home
