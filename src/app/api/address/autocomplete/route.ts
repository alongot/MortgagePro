import { NextRequest, NextResponse } from "next/server";

// Radar.io autocomplete API
// Docs: https://radar.io/documentation/api#autocomplete

const RADAR_API_KEY = process.env.RADAR_API_KEY;

interface RadarAddress {
  addressLabel: string;
  formattedAddress: string;
  city: string;
  state: string;
  stateCode: string;
  postalCode: string;
  country: string;
  countryCode: string;
  latitude: number;
  longitude: number;
  number?: string;
  street?: string;
  neighborhood?: string;
  county?: string;
}

interface RadarResponse {
  meta: { code: number };
  addresses: RadarAddress[];
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("query");

  if (!query || query.length < 3) {
    return NextResponse.json({ addresses: [] });
  }

  if (!RADAR_API_KEY) {
    return NextResponse.json(
      { error: "Radar API key not configured" },
      { status: 500 }
    );
  }

  try {
    const params = new URLSearchParams({
      query,
      country: "US",
      layers: "address",
      limit: "6",
    });

    const response = await fetch(
      `https://api.radar.io/v1/search/autocomplete?${params.toString()}`,
      {
        headers: {
          Authorization: RADAR_API_KEY,
        },
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error("Radar API error:", error);
      return NextResponse.json(
        { error: "Address lookup failed" },
        { status: response.status }
      );
    }

    const data: RadarResponse = await response.json();

    // Transform to simpler format
    const addresses = data.addresses.map((addr) => ({
      display: addr.formattedAddress,
      street: addr.addressLabel || `${addr.number || ""} ${addr.street || ""}`.trim(),
      city: addr.city,
      state: addr.stateCode,
      zip: addr.postalCode,
      latitude: addr.latitude,
      longitude: addr.longitude,
    }));

    return NextResponse.json({ addresses });
  } catch (error) {
    console.error("Radar autocomplete error:", error);
    return NextResponse.json(
      { error: "Address lookup failed" },
      { status: 500 }
    );
  }
}
