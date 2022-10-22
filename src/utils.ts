export const loadGoogleScript: (src: string) => Promise<void> = (src: string) => {
    return new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) return resolve()
        const script = document.createElement('script')
        script.src = src
        script.async = true;
        script.defer = true;
        script.onload = () => resolve()
        script.onerror = (err) => reject(err)
        document.body.appendChild(script)
    })
}
