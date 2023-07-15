import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Row, Col, ListGroup, Image, Card } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import ErrorMessage from '../components/Message/errorMessage';
import CheckoutSteps from '../components/CheckoutStep/CheckoutSteps';
import { createOrder } from '../actions/orderAction';
import * as routes from '../constants/routes';
import { interpolate } from '../utils/string';
import * as orderConstants from '../constants/orderConstants';
import { Button, CircularProgress, makeStyles } from '@material-ui/core/';
import axios from '../../node_modules/axios/index';
import config from 'config';
import http from 'utils/http';

const useStyles = makeStyles((theme) => ({
  prgressColor: {
    color: '#fff',
  },
}));

const PlaceOrder = ({ history }) => {
  const dispatch = useDispatch();
  const classes = useStyles();

  const cart = useSelector((state) => state.cart);

  const redirectUser = !localStorage.getItem('shippingAddress')
    ? routes.SHIPPING
    : !localStorage.getItem('paymentMethod')
    ? routes.PAYMENT
    : null;

  if (redirectUser) {
    history.push(redirectUser);
  }

  //   Calculate prices
  const addDecimals = (num) => {
    return (Math.round(num * 100) / 100).toFixed(2);
  };

  cart.itemsPrice = addDecimals(cart.cartItems.reduce((acc, item) => acc + item.price * item.qty, 0));
  cart.shippingPrice = addDecimals(cart.itemsPrice > 100 ? 0 : 100);
  cart.taxPrice = addDecimals(Number((0.15 * cart.itemsPrice).toFixed(2)));
  cart.totalPrice = (Number(cart.itemsPrice) + Number(cart.shippingPrice) + Number(cart.taxPrice)).toFixed(2);

  const orderCreate = useSelector((state) => state.createOrder);
  const { order, success, error, loading } = orderCreate;

  const getCurrentUser = () => {
    const storedUser = localStorage.getItem('userInfo');
    return storedUser ? JSON.parse(storedUser) : null;
  };

  useEffect(() => {
    if (success) {
      history.push({
        pathname: interpolate(routes.ORDER, { orderId: order._id }),
      });
    }
    // eslint-disable-next-line
  }, [history, success]);

  let reqbody
  useEffect(() => {
    const user = getCurrentUser()
    console.log('user :>> ', user);
  },[])
  
  reqbody = {
    orderItems: cart.cartItems,
    shipping: cart.shippingAddress,
    payment: {
      paymentMethod: cart.paymentMethod,
    },
    itemsPrice: cart.itemsPrice,
    shippingPrice: cart.shippingPrice,
    taxPrice: cart.taxPrice,
    totalPrice: parseInt(cart.totalPrice),
  };

  // console.log('create', body)
  const placeOrderHandler = () => {
    // dispatch(
    // createOrder({
    //     orderItems: cart.cartItems,
    //     shipping: cart.dress,
    //     payment: {
    //       paymentMethod: cart.paymentMethod,
    //     },
    //     itemsPrice: cart.itemsPrice,
    //     shippingPrice: cart.shippingPrice,
    //     taxPrice: cart.taxPrice,
    //     totalPrice: cart.totalPrice,
    //   })
    // );
    displayRazorpay()
  };

  function loadScript(src) {
    return new Promise((resolve) => {
        const script = document.createElement("script");
        script.src = src;
        script.onload = () => {
            resolve(true);
        };
        script.onerror = () => {
            resolve(false);
        };
        document.body.appendChild(script);
    });
  }

  async function displayRazorpay() {
    const res = await loadScript(
        "https://checkout.razorpay.com/v1/checkout.js"
    );

    if (!res) {
        alert("Razorpay SDK failed to load. Are you online?");
        return;
    }
    console.log('108 :>> ', 108);
    // creating a new order
        const user = getCurrentUser()
    console.log('user :>> ', user);
    // console.log('create', body)

    const body = {
      reqbody,
      user
    }

    const result = await http.post(config.apiEndPoint.order.createOrder, { body , accessToken: true, user });
    console.log('result', result.data)
    if (!result) {
        alert("Server error. Are you online?");
        return;
    }

    // Getting the order details back
    const { amount, id: order_id } = result.data;

    const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID, // Enter the Key ID generated from the Dashboard
        amount: amount*100,
        currency: 'INR',
        name: "Shop Point.",
        description: "Test Transaction",
        // image: { logo },
        order_id: order_id,
        handler: async function (response) {
            alert('succesful')
            
            // const data = {
            //     orderCreationId: order_id,
            //     razorpayPaymentId: response.razorpay_payment_id,
            //     razorpayOrderId: response.razorpay_order_id,
            //     razorpaySignature: response.razorpay_signature,
            // };
            // try {
            //   const result = await axios.post("http://localhost:5000/payment/success", data);
  
            //   alert(result.data.msg);
              
            // } catch (error) {
            //   alert(error.message)  
            // }
        },
        prefill: {
            name: "",
            email: user.email,
            contact: "",
        },
        notes: {
            address: "Shop Point Private Limited",
        },
        theme: {
            color: "#61dafb",
        },
    };

    const paymentObject = new window.Razorpay(options);
    console.log('179', 179)
    paymentObject.open();
}

  return (
    <>
      {error && <ErrorMessage header="Create Order Error" message={error} reset={orderConstants.CREATE_ORDER_RESET} />}
      <CheckoutSteps step1 step2 step3 />
      <Row>
        <Col md={8}>
          <ListGroup variant="flush">
            <ListGroup.Item>
              <h2>Shipping</h2>
              <p>
                <strong>Address:</strong>
                {cart.shippingAddress.address}, {cart.shippingAddress.city} {cart.shippingAddress.postalCode},{' '}
                {cart.shippingAddress.country}
              </p>
            </ListGroup.Item>

            <ListGroup.Item>
              <h2>Payment Method</h2>
              <strong>Method: </strong>
              {cart.paymentMethod}
            </ListGroup.Item>

            <ListGroup.Item>
              <h2>Order Items</h2>
              {!cart.cartItems.length ? (
                <>Your cart is empty</>
              ) : (
                <ListGroup variant="flush">
                  {cart.cartItems.map((item, index) => (
                    <ListGroup.Item key={index}>
                      <Row>
                        <Col md={1}>
                          <Image src={item.productImage} alt={item.productName} fluid rounded />
                        </Col>
                        <Col>
                          <Link
                            to={interpolate(routes.PRODUCT, {
                              productId: item.productId,
                            })}
                          >
                            {item.productName}
                          </Link>
                        </Col>
                        <Col md={4}>
                          {item.qty} x ₹{item.price} = ₹{item.qty * item.price}
                        </Col>
                      </Row>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}
            </ListGroup.Item>
          </ListGroup>
        </Col>
        <Col md={4}>
          <Card>
            <ListGroup variant="flush">
              <ListGroup.Item>
                <h2>Order Summary</h2>
              </ListGroup.Item>
              <ListGroup.Item>
                <Row>
                  <Col>Items</Col>
                  <Col>₹{cart.itemsPrice}</Col>
                </Row>
              </ListGroup.Item>
              <ListGroup.Item>
                <Row>
                  <Col>Shipping</Col>
                  <Col>₹{cart.shippingPrice}</Col>
                </Row>
              </ListGroup.Item>
              <ListGroup.Item>
                <Row>
                  <Col>Tax</Col>
                  <Col>₹{cart.taxPrice}</Col>
                </Row>
              </ListGroup.Item>
              <ListGroup.Item>
                <Row>
                  <Col>Total</Col>
                  <Col>₹{cart.totalPrice}</Col>
                </Row>
              </ListGroup.Item>
              <ListGroup.Item>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                  disabled={!cart.cartItems || loading}
                  onClick={placeOrderHandler}
                >
                  {loading ? <CircularProgress color="inherit" className={classes.prgressColor} /> : <>Place Order</>}
                </Button>
              </ListGroup.Item>
            </ListGroup>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default PlaceOrder;
