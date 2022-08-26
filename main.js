import { ethers } from 'ethers'
import fetch from 'node-fetch'

const provider = new ethers.providers.JsonRpcProvider("https://cloudflare-eth.com");

const endpointUrl = "http://localhost:8080/dev/banners";

const cached = {};

const wait = (sec = 1) => new Promise(resolve => setTimeout(resolve, sec * 1000));

const main = async () => {
    try {
        console.log("FIRST");
        
        const { banners } = await (await fetch(endpointUrl)).json();

        for (let i = 0; i < banners.length; i++) {
            const banner = banners[i];

            if (cached[banner.id]) {
                continue;
            } else {
                cached[banner.id] = true;
            }

            debugger;
            try {
                const ensAccount = await provider.lookupAddress(banner.account);

                if (ensAccount) {
                    console.log("FOURTH");

                    console.log(`${new Date().toLocaleDateString()} - update ${banner.id} to ${ensAccount}`)

                    await fetch(endpointUrl, {
                        method: "PUT",
                        body: JSON.stringify({
                            id: banner.id,
                            account: ensAccount,
                        }),
                        headers: {
                            'Content-Type': 'application/json'
                        },
                    });
                }
            } catch (err) {
                console.log("THIRD");
                continue;
            }
        }
    } catch (err) {
        console.log("SECOND");
    }

    await wait();

    main();
}

main();

// pm2 start --name board-dapp-third