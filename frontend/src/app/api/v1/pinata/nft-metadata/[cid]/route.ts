import { NextResponse } from 'next/server'
import axios from 'axios'

const PINATA_API_KEY = process.env.PINATA_API_KEY
const PINATA_SECRET_API_KEY = process.env.PINATA_SECRET_API_KEY
const PINATA_API_URL = 'https://api.pinata.cloud'

export async function DELETE(request: Request) {
	try {
		const { cid } = await request.json()

		// PinataのDelete FileAPI(Unpin) APIを叩く
		const response = await axios.delete(`${PINATA_API_URL}/pinning/unpin/${cid}`, {
			headers: {
				pinata_api_key: PINATA_API_KEY,
				pinata_secret_api_key: PINATA_SECRET_API_KEY
			}
		})

		return NextResponse.json({ success: true, data: response.data})
	} catch (error: any) {
		return NextResponse.json({ success: false, error: error.message })
	}
} 