export const checkYtDomainVaild = (
  url: string,
): boolean => {
  if (!url.startsWith("https://")) {
    return false;
  }

  const parsedUrl = new URL(url);

  const pattern =
    /^(www\.)?(youtube|yt|youtu)\.\w{2,3}(.\w{2,3})?$/gi;

  return pattern.test(parsedUrl.hostname);
};
