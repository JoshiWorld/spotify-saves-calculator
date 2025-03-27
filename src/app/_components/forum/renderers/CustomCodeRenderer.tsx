'use client'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomCodeRenderer({ data }: any) {
  // eslint-disable-next-line @typescript-eslint/no-unused-expressions
  (data)

  return (
    <pre className='bg-gray-800 rounded-md p-4'>
      <code className='text-gray-100 text-sm'>{
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      data.code
      }</code>
    </pre>
  )
}

export default CustomCodeRenderer
