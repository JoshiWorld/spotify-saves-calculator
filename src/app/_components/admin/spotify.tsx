"use client";

import { api } from "@/trpc/react";
import { Button } from "../landing/button";

export function SpotifyAdmin() {
  const { data, isLoading, isError, error } = api.spotify.get.useQuery();
  const { mutateAsync } = api.spotify.getCode.useMutation();

  if (isLoading) return <p>Loading data..</p>;
  if (isError) return <p>Error Loading data: {error.message}</p>;

  const handleSpotifyAuth = async () => {
    const { authUrl } = await mutateAsync();
    window.location.href = authUrl;
  }

  return (
    <div className="flex w-full flex-col">
      {data ? <p>Data</p> : <p>No Data</p>}
      <Button onClick={handleSpotifyAuth}>Button</Button>
    </div>
  );
}
