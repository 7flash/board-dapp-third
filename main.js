import { ethers } from 'ethers'
import fetch from 'node-fetch'
import randomAvatarGenerator from "@fractalsoftware/random-avatar-generator";

const provider = new ethers.providers.JsonRpcProvider("https://cloudflare-eth.com");

const endpointUrl = "http://localhost:8080/dev/banners";

const cached = {};

const wait = (sec = 1) => new Promise(resolve => setTimeout(resolve, sec * 1000));

const main = async () => {
    try {
        const { banners } = await (await fetch(endpointUrl)).json();

        for (let i = 0; i < banners.length; i++) {
            const banner = banners[i];

            if (cached[banner.id]) {
                continue;
            } else {
                cached[banner.id] = true;
            }

            try {
                let account;
                try {
                    account = await provider.lookupAddress(banner.account);
                } catch (_) {}

                if (!account) {
                    account = banner.account;
                }

                if (!account) {
                    account = "Anonymous";
                }

                const avatar = randomAvatarGenerator.generateRandomAvatarData(3);

                console.log(`${new Date().toLocaleDateString()} - update ${banner.id} to ${account} with avatar ${avatar}`)

                await fetch(endpointUrl, {
                    method: "PUT",
                    body: JSON.stringify({
                        id: banner.id,
                        account: account,
                        avatar: avatar,
                    }),
                    headers: {
                        'Content-Type': 'application/json'
                    },
                });
            } catch (err) {
                console.error(err)
                await wait()
            }
        }
    } catch (err) {
        console.error(err)
        await wait()
    }

    await wait();

    main();
}

main();

// pm2 start --name board-dapp-third