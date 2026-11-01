
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  output: "export",
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  // Dev-only resources (/_next/* chunks, the HMR websocket, the error overlay)
  // are blocked unless the host typed in the browser is listed here. `*`
  // matches one dot-separated label, `**` matches the rest. localhost,
  // **.localhost and the server hostname are allowlisted by Next itself.
  allowedDevOrigins: [
    "0.0.0.0",
    "192.168.50.123", // this Mac on the LAN
    "192.168.50.*", // survives a DHCP change on the same subnet
    "**.local", // mDNS: http://<machine-name>.local:3000
  ],
};

export default nextConfig;

