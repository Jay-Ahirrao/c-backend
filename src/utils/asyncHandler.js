const asyncHandler = (requestHandler) => (req,res,next ) => {
    Promise.resolve(requestHandler(req,res,next)).reject((error) => {next(error)})
}

export {asyncHandler}


//notes
// const asyncHandler =  () => {}
// const asyncHandler =  (fn) => { () => {} }
// const asyncHandler =  (fn) => () => { }           // just removed braces from previous code !!!
/*
const asyncHandler = (fn) => async (req,res,next) => {
    try {
        await fn(req,res,next)
    } catch (error) {
        res.status(error.code || 500).json({success:false,message:error.message})
    }
}   
*/ 