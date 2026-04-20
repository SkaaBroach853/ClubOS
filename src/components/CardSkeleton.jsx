import React from 'react';

export const CardSkeleton = () => (
  <div className="flex flex-col gap-4 animate-pulse pt-2 px-2">
    <div className="h-6 w-3/4 rounded-md bg-[#2a2a30]"></div>
    <div className="h-4 w-full rounded-md bg-[#2a2a30]"></div>
    <div className="h-4 w-5/6 rounded-md bg-[#2a2a30]"></div>
    <div className="h-4 w-4/6 rounded-md bg-[#2a2a30]"></div>
    <div className="h-4 w-full rounded-md bg-[#2a2a30]"></div>
    <div className="h-4 w-3/4 rounded-md bg-[#2a2a30]"></div>
  </div>
);
