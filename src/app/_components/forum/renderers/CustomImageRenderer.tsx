'use client'

import Image from 'next/image'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomImageRenderer({ data }: any) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
  const src = data.file.url

  return (
    <div className='relative w-full min-h-60'>
      <Image alt='image' className='object-contain' fill src={
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        src
        } />
    </div>
  )
}

export default CustomImageRenderer
