// next.config.mjs
export default {
  env: {
    NEXT_PUBLIC_API_URL:
      process.env.NODE_ENV === "development"
        ? process.env.NEXT_PUBLIC_API_URL_LOCALHOST
        : process.env.NEXT_PUBLIC_API_URL_IP || NEXT_PUBLIC_API_URL_ETHERNET,
  },
};
