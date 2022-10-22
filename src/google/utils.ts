
export interface Metadata {
    name: string,
    parents: string[],
    mimeType: string
}

export const uploadFileToDrive = async (metadata: Metadata, fileContent: string) => {
    const file = new Blob([fileContent], { type: 'text/plain' });
    const accessToken = gapi.auth.getToken().access_token;
    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', file);

    return fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id', {
        method: "POST",
        headers: new Headers({ 'Authorization': 'Bearer ' + accessToken }),
        body: form
    })
}
