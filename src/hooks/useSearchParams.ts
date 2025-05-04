import { useEffect } from "react";
import { useSearchParams } from "react-router";

interface QueryParams {
  [key: string]: string | null;
}

export default function useQueryParams(defaultParams?: QueryParams) {
  const [searchParams, setSearchParams] = useSearchParams();

  function updateParams(update: QueryParams) {
    setSearchParams((prevParams) => {
      const newParams = new URLSearchParams(
        Object.fromEntries(
          Object.entries({
            ...Object.fromEntries(prevParams.entries()),
            ...update,
          }).filter((entry): entry is [string, string] => entry[1] !== null)
        )
      );

      return newParams;
    });
  }

  function getParams(): QueryParams {
    const resp: QueryParams = {};
    for (const key of searchParams.keys()) {
      resp[key] = searchParams.get(key);
    }
    return resp;
  }

  function setIntialParams() {
    const toUpdateParams: QueryParams = { ...defaultParams };

    for (const key in defaultParams) {
      if (searchParams.get(key)) {
        delete toUpdateParams[key];
      }
      updateParams(toUpdateParams);
    }
  }

  useEffect(() => {
    setIntialParams();
  }, []);

  return { searchParams, updateParams, getParams };
}
