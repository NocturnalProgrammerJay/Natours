/*eslint-disable*/
import axios from 'axios'
import { showAlert } from './alerts'
const stripe = Stripe('pk_test_51MUT4OKVrl79ZKyWc7ufkh8PVfPUxbmAjGAL8Mpkyoh70AGoWq8KX1IncQsdi2S0w4GVJlHpWGra5S8iP3HCz6ei00bUNR6XqI')

export const bookTour = async tourId => {
    try{

        // 1) Get checkout session from API
        const session = await axios(`http://127.0.0.1:3000/api/v1/bookings/checkout-session/${tourId}`)
        
        console.log(session)
        
        // 2) Create checkout form + charge credit card
        await stripe.redirectToCheckout({
            sessionId: session.data.session.id
        })



    }catch(err){
        console.log(err)
        showAlert('error', err)
    }

}