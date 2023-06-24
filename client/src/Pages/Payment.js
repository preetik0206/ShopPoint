import React, { useState } from 'react';
import { Col, Form, Row } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import FormContainer from '../components/FormContainer/FormContainer';
import CheckoutSteps from '../components/CheckoutStep/CheckoutSteps';
import { savePaymentMethod } from '../actions/cartAction';
import * as routes from '../constants/routes';
import { Button, Radio, RadioGroup, FormControlLabel, FormControl, FormLabel } from '@material-ui/core/';

const PaymentMethod = ({ history }) => {
  if (!localStorage.getItem('shippingAddress')) {
    history.push({
      pathname: routes.SHIPPING,
    });
  }

  const [paymentMethod, setPaymentMethod] = useState('');

  const dispatch = useDispatch();

  const submitHandler = (e) => {
    e.preventDefault();
    if (paymentMethod === '') {
      return;
    }
    dispatch(savePaymentMethod(paymentMethod));
    history.push({
      pathname: routes.PLACE_ORDER,
    });
  };

  return (
    <FormContainer>
      <CheckoutSteps step1 step2 />
      <h1>Payment Method</h1>
      <div style={{ textAlign: 'center' }}>
        <Form onSubmit={submitHandler}>
          <FormControl component="fieldset">
            <FormLabel component="legend">Select Method</FormLabel>
            <Row>
              <Col md="8">
                <RadioGroup
                  aria-label="paymemtMethod"
                  name="paymemtMethod"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  <FormControlLabel value="PayPal" control={<Radio color="primary" />} label={<span style={{ whiteSpace: 'nowrap' }}>PayPal or Credit Card</span>} />
                </RadioGroup>
              </Col>
            </Row>
          </FormControl>

          <Button type="submit" variant="contained" color="primary" fullWidth>
            Continue
          </Button>
        </Form>
      </div>
    </FormContainer>
  );
};

export default PaymentMethod;
