import React from 'react'
import UploadFileToS3 from './UploadFileToS3';


const ClientSite = () => {

    return (
        <div className='text-white ml-8'>
            <div>
                    <UploadFileToS3 />
            </div>
        </div>
    )
}

export default ClientSite