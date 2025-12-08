const fs = require('fs').promises

const deleteFile = async (filePath) => {
    try {
        //check the file exists before deleting 
        await fs.access(filePath)

        //Delete the file
        await fs.unlink(filePath);
    } catch (error) {
        if(error.code === 'ENOENT') {
            console.log('File does not exist')
        } else {
            console.log("Error deleting file", error)
        }
    }
}

const randomNumberGeneration = (len) => {
    const value = `1234567890qwertyuiopasdfghjklzxcvbnm`
    let number = []

    for(let x = 0; x<len; x++){
        let position = Math.floor(Math.random()*value.length);
        number.push(value[position])
    }

    return number.join('')
}

module.exports = {
    deleteFile,
    randomNumberGeneration
}