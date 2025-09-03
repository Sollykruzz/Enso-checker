import { useState } from 'react';
import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

// API handler embedded in the same file
export async function getServerSideProps({ query }: { query: any }) {
  const username = query.username || null;
  let eligible = null;

  if (username) {
    try {
      const BEARER_TOKEN = process.env.TWITTER_BEARER;
      const userRes = await axios.get(`https://api.twitter.com/2/users/by/username/${username}`, {
        headers: { Authorization: `Bearer ${BEARER_TOKEN}` },
      });

      const userId = userRes.data.data.id;

      const tweetsRes = await axios.get(
        `https://api.twitter.com/2/users/${userId}/tweets?max_results=20`,
        { headers: { Authorization: `Bearer ${BEARER_TOKEN}` } }
      );

      const tweets = tweetsRes.data.data || [];
      eligible = tweets.some((tweet: any) =>
        /enso|\$enso/i.test(tweet.text)
      );
    } catch (error) {
      eligible = 'error';
    }
  }

  return {
    props: { username, eligible },
  };
}

export default function Home({ username, eligible }: { username: string | null; eligible: boolean | string | null }) {
  const [input, setInput] = useState('');

  return (
    <main style={{ textAlign: 'center', marginTop: '5rem' }}>
      <h1>Enso Eligibility Checker</h1>
      <form method="get">
        <input
          type="text"
          name="username"
          placeholder="Enter X username"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          style={{ padding: '0.5rem', fontSize: '1rem' }}
        />
        <button type="submit" style={{ marginLeft: '1rem', padding: '0.5rem 1rem' }}>
          Check
        </button>
      </form>
      {eligible !== null && (
        <h2 style={{ marginTop: '2rem' }}>
          {eligible === 'error' ? '❌ Error checking eligibility' : eligible ? '✔ Eligible' : '❌ Not Eligible'}
        </h2>
      )}
    </main>
  );
}
