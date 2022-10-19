import React from 'react'
import type { NextPage } from 'next'
import Head from 'next/head'
import { Wallet } from 'ethers'
import { Box, Button, ButtonGroup, Flex, Heading } from '@chakra-ui/react'


const GOOGLE_CLEINT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

const loadGoogleScript: (src: string) => Promise<void> = (src: string) =>
  new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve()
    const script = document.createElement('script')
    script.src = src
    script.onload = () => resolve()
    script.onerror = (err) => reject(err)
    document.body.appendChild(script)
  })


const Home: NextPage = () => {
  // google user
  const [tokenClient, setTokenClient] = React.useState<any>({})
  const [gapiInited, setGapiInited] = React.useState(false)
  const [gisInited, setGisInited] = React.useState(false)
  const [session, setSession] = React.useState<any>({})
  const [loading, setLoading] = React.useState(false)

  // wallets
  const [wallet, setWallet] = React.useState<Wallet | null>(null)

  // ui
  const googleButton = React.useRef(null);

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
    setLoading(false)
  }

  const handleGDImport = async () => {
    setLoading(true)
    try {
      // todo

    }
    catch {

    }
    setLoading(false)
  }

  function handleCredentialResponse(response: any) {
    console.log("Encoded JWT ID token: " + response.credential);
  }

  function gapiInit() {
    // @ts-ignore
    const gapi = window.gapi;
    gapi.client.init({})
      .then(function () {  // Load the Calendar API discovery document.
        gapi.client.load('https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest');
        // gapiInited = true;
        setGapiInited(true)
      });
  }


  function showEvents() {
    // @ts-ignore
    const gapi = window.gapi

    tokenClient.callback = (resp: any) => {
      if (resp.error !== undefined) {
        throw(resp);
      }
      // GIS has automatically updated gapi.client with the newly issued access token.
      console.log('gapi.client access token: ' + JSON.stringify(gapi.client.getToken()));

      gapi.client.calendar.events.list({ 'calendarId': 'primary' })
      .then((calendarAPIResponse: any) => console.log(JSON.stringify(calendarAPIResponse)))
      .catch((err: Error) => console.log(err));
    }

    // Conditionally ask users to select the Google Account they'd like to use,
    // and explicitly obtain their consent to fetch their Calendar.
    // NOTE: To request an access token a user gesture is necessary.
    if (gapi.client.getToken() === null) {
      // Prompt the user to select an Google Account and asked for consent to share their data
      // when establishing a new session.
      tokenClient.requestAccessToken({prompt: 'consent'});
    } else {
      // Skip display of account chooser and consent dialog for an existing session.
      tokenClient.requestAccessToken({prompt: ''});
    }
  }

  function revokeToken() {
    // @ts-ignore
    const gapi = window.gapi
    // @ts-ignore
    const google = window.google
    let cred = gapi.client.getToken();
    if (cred !== null) {
      google.accounts.oauth2.revoke(cred.access_token, () => {console.log('Revoked: ' + cred.access_token)});
      gapi.client.setToken('');
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
        // @ts-ignore
        const google = window.google;
        setTokenClient(google.accounts.oauth2.initTokenClient({
          client_id: GOOGLE_CLEINT_ID,
          scope: 'https://www.googleapis.com/auth/calendar.readonly',
          callback: '',  // defined at request time
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
        // @ts-ignore
        const gapi = window.gapi;
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

          <Button hidden={gapiInited && gisInited} onClick={showEvents}>
            Show Calendar
          </Button>

          <Button hidden={gapiInited && gisInited} onClick={revokeToken}>
            Revoke token
          </Button> 

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
        <ButtonGroup m={50} ref={googleButton} backgroundColor='black'>
        </ButtonGroup>

      </Flex>
    </Box>
  )
}

export default Home
