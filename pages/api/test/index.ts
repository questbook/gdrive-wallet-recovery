import type { NextApiHandler } from "next";
import { getSession } from "next-auth/client";
import { google } from "googleapis";

const TestHandler: NextApiHandler = async (req, res) => {
    const session = await getSession({ req });

    if (!session) {
        res.status(401);
        return
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const accessToken = String(session.accessToken);
    const refreshToken = String(session.refreshToken);

    const auth = new google.auth.OAuth2({
        clientId,
        clientSecret,
    });
    auth.setCredentials({
        access_token: accessToken,
        refresh_token: refreshToken,
    });

    const drive = google.drive({ auth, version: "v3" });

    const result = await drive.files.list({
        pageSize: 10,
        fields: 'nextPageToken, files(id, name)'
    });
    const files = result.data.files;
    if (!files || files.length === 0) {
        console.log('No files found.');
        return;
    }
    console.log('Files:');
    files.map((file) => {
        console.log(`${file.name} (${file.id})`);
    });
    res.json(files)
    // new Promise(() => {}).then((data) => {
    //     console.debug(data.data);
    //     res.json(data.data);
    // })
    //     .catch((e) => {
    //         const error = e?.stack ?? e?.response?.data?.error;
    //         res.status(error?.code ?? 500).json(error ?? e);
    //     });
};

export default TestHandler;
