import { Loader2 } from 'lucide-react'
import React from 'react'
import { Progress } from './progress'

function Spinner() {
  return (
    <>
      <div className="flex justify-center items-center ">
        <Loader2 className="mr-2 h-4 w-4 animate-spin text-black" />
      </div>
    </>
  )
}

export default Spinner