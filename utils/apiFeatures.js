
class APIFeatures {
  // mongoose query and express query
  constructor(query, queryString){
    this.query = query
    this.queryString = queryString
  }

  filter(){
    const queryObj = {...this.queryString} 
    const excludeFields = ['page', 'sort', 'limit', 'fields'] 
    excludeFields.forEach(el => delete queryObj[el])
   
    let queryStr = JSON.stringify(queryObj)
   
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`)
    
    this.query = this.query.find(JSON.parse(queryStr))

    return this
  }

  sort(){
    if (this.queryString.sort){ // original object
      const sortBy = this.queryString.sort.split(',').join(' ')
      this.query = this.query.sort(sortBy)
      //http://127.0.0.1:3000/api/v1/tours?sort=price,ratingsAverage
      //how to sort by multiple params in mongodb, sort('price ratingsAverage')
    }else{
      this.query = this.query.sort('-createdAt')
    }
    return this
  }

  limitFields(){
     if (this.queryString.fields){
      // ex: http://127.0.0.1:3000/api/v1/tours?fields=name,duration,difficulty,price
      // ex: http://127.0.0.1:3000/api/v1/tours?fields-=name,duration,difficulty,price the '-' means return all the data without these fields name, duration, difficulty, and price
      const fields = this.queryString.fields.split(',').join(' ') // 
      this.query = this.query.select(fields) //projection - selecting only specific fields:values from the object
    }else{
      this.query = this.query.select('-__v') // '-' excluding only this field
    }
    return this
  }

  paginate(){
    const page = this.queryString.page * 1 || 1 //defaults to 1
    const limit = this.queryString.limit * 1 || 100 //defaults to 100
    const skip = (page - 1) * limit //if page = 3 we want results of (21 through 30) so 3 - 1 * 10 = 20, if we skip 20 then we are at result # 21

    // limit means amount of results we want in the query, skip means the amount of queries that should be skipped before querying data
    // /?page=2&limit=10 the user wants page 2 with 10 results. means results 1-10 is one page 1 and 11-20 is on page 2
    this.query = this.query.skip(skip).limit(limit)

    // if(this.queryString.page){
    //   const numTours = await Tour.countDocuments() //return number of documents
    // if the number of documents that we skip are greater than the number of documents that exist then throw error
    //   if (skip >= numTours) throw new Error(`This page does not exists`)
    // }
    return this
  }
}
module.exports = APIFeatures