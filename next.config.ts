import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  turbopack: {
    // Evita o aviso de "workspace root" incorreto: há um package-lock.json
    // num diretório acima (outros projetos do monorepo local), e sem isso o
    // Next tenta usá-lo como raiz do workspace.
    root: path.join(__dirname),
  },
};

export default nextConfig;
