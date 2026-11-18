import React from 'react'
import PaymentPage from '@/components/PaymentPage'
import { notFound } from 'next/navigation';
import connectDb from '@/db/connectDb';
import User from '@/models/User';


const Username = async ({ params }) => {
  const { username } = await params;

  // Check whether the username exists in the database
  await connectDb();

  const user = await User.findOne({ username });

  // If the username is not present, show the 404 page
  if (!user) {
    notFound();
  }

  return (
    <>
      <PaymentPage username={username} />
    </>
  );
};

export default Username;

export async function generateMetadata({ params }) {
  const { username } = await params;

  return {
    title: `Support ${username} - Get Me A Funding`,
  };
}
