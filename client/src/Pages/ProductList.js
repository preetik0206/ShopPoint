import React  from 'react';
import { Button as MaterialButton, CircularProgress, makeStyles, TextField } from '@material-ui/core/';
import config from 'config';
import { useEffect, useState } from 'react';
import { Button, Col, Container, Form, Modal, Row, Table } from 'react-bootstrap';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import { useDispatch, useSelector } from 'react-redux';
import { LinkContainer } from 'react-router-bootstrap';
import axios from '../../node_modules/axios/index';
import { deleteProduct, productListForAdmin } from '../actions/productAction';
import TableLoader from '../components/Loader/TableLoader';
import ErrorMessage from '../components/Message/errorMessage';
import SuccessMessage from '../components/Message/successMessage';
import * as productConstants from '../constants/productConstants';
import * as routes from '../constants/routes';
import { interpolate } from '../utils/string';
import { Input } from '../../node_modules/@material-ui/core/index';


const useStyles = makeStyles((theme) => ({
  typography: {
    padding: theme.spacing(2),
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 330,
    top: 6,
    left: -4,
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
  prgressColor: {
    color: '#fff',
  },
}));

const ProductList = () => {
  const dispatch = useDispatch();

  const productList = useSelector((state) => state.productList);
  const { loading, products, count, error, success } = productList;

  const deleteProductData = useSelector((state) => state.deleteProduct);
  const { success: deleteSuccess, error: deleteFail } = deleteProductData;

  const createProductDetails = useSelector((state) => state.createProductDetails);
  const { success: createSuccess, error: createFail, loading: createLoading } = createProductDetails;

  const classes = useStyles();

  const [name, setName] = useState('');
  const [productImage, setProductImage] = useState('');
  const [brand, setBrand] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [countInStock, setCountInStock] = useState(0);
  const [description, setDescription] = useState('');
  const [openForm, setOpenForm] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    // createProduct();
    submitHandler()
    // console.log(createProduct);
    if (createSuccess) {
      setOpenForm(false);
      setName('');
      setProductImage('');
      setBrand('');
      setPrice('');
      setCategory('');
      setCountInStock('');
      setDescription('');

      dispatch({ type: productConstants.CREATE_PRODUCT_RESET });
    }

    dispatch(productListForAdmin(initialLoading));

    // eslint-disable-next-line
  }, [dispatch, deleteSuccess, createSuccess]);

  useEffect(() => {
    if (success && initialLoading) {
      setInitialLoading(false);
    }
    // eslint-disable-next-line
  }, [dispatch, success]);

  // const createProduct = async () => {
  //   console.log('92', 92)
  //   const body = {
  //     name,
  //     category,
  //     productImage,
  //     description,
  //     brand,
  //     price,
  //     countInStock,
  //   };
  //   const createProduct = await axios.post({
  //     body,
  //     accessToken: true,
  //   });
  // };

  const cancelCreateProduct = () => {
    setOpenForm(false);
  };

  const submitHandler = async (e) => {
    if(e){
      console.log('e', e)
    }
    console.log('113 :>> ', 113);
    const product = {
      name,
      category,
      description,
      productImage,
      brand,
      price,
      countInStock,
    };
    const createProduct = await axios.post(config.apiEndPoint.product.createProduct, {
      product,
      accessToken: true,
    });

    // e.preventDefault();
    if (
      name === '' ||
      category === '' ||
      productImage === '' ||
      description === '' ||
      brand === '' ||
      price === '' ||
      countInStock === ''
    ) {
      return;
    }

    const formData = new FormData();

    formData.append('name', name);
    formData.append('productImage', productImage);
    formData.append('brand', brand);
    formData.append('price', price);
    formData.append('category', category);
    formData.append('countInStock', countInStock);
    formData.append('description', description);
    dispatch(createProduct(formData));
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = () => {
      const base64 = reader.result;
      console.log('base64 :>> ', base64);
      setProductImage(base64);
    };
    console.log('productImage', productImage)
    if (file) {
      reader.readAsDataURL(file);
    }
  };

  const openNewProductForm = () => {
    if (openForm) {
      return (
        <>
          <Modal show={openForm} size="lg" aria-labelledby="contained-modal-title-vcenter" centered>
            <Modal.Header>
              <Modal.Title id="contained-modal-title-vcenter"> </Modal.Title>
            </Modal.Header>
            {createFail && (
              <ErrorMessage
                header="Something went wrong"
                message={createFail}
                reset={productConstants.CREATE_PRODUCT_RESET}
              />
            )}
            <Form onSubmit={submitHandler}>
              <Modal.Body className="show-grid">
                <Container>
                  <Row>
                    <Col xs={12} md={6}>
                      <TextField
                        variant="outlined"
                        type="text"
                        margin="normal"
                        required
                        fullWidth
                        id="name"
                        label="Name"
                        name="name"
                        autoComplete="name"
                        autoFocus
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </Col>
                    <Col xs={12} md={6}>
                      <TextField
                        variant="outlined"
                        type="text"
                        margin="normal"
                        required
                        fullWidth
                        id="brand"
                        label="Brand"
                        name="brand"
                        autoComplete="brand"
                        autoFocus
                        value={brand}
                        onChange={(e) => setBrand(e.target.value)}
                      />
                    </Col>
                  </Row>

                  <Row>
                    <Col xs={12} md={6}>
                      <TextField
                        variant="outlined"
                        type="number"
                        margin="normal"
                        required
                        fullWidth
                        id="price"
                        label="Price"
                        name="price"
                        autoComplete="price"
                        autoFocus
                        value={price}
                        onChange={(e) => setPrice(Number(e.target.value))}
                      />
                    </Col>
                    <Col xs={12} md={6}>
                      <TextField
                        variant="outlined"
                        type="number"
                        margin="normal"
                        required
                        fullWidth
                        id="countInStock"
                        label="CountInStock"
                        name="countInStock"
                        autoComplete="countInStock"
                        autoFocus
                        value={countInStock}
                        onChange={(e) => setCountInStock(Number(e.target.value))}
                      />
                    </Col>
                  </Row>
                  <Row>
                    <Col xs={12} md={6}>
                      <Input type="file" onChange={handleImageUpload} />
                    </Col>
                    <Col xs={12} md={6}>
                      <TextField
                        variant="outlined"
                        type="text"
                        margin="normal"
                        required
                        fullWidth
                        id="description"
                        label="Description"
                        name="description"
                        autoComplete="description"
                        autoFocus
                        value={description}
                        multiline
                        rows={5}
                        onChange={(e) => setDescription(e.target.value)}
                      />
                    </Col>
                  </Row>
                </Container>
              </Modal.Body>
              <Modal.Footer>
                <MaterialButton
                  type="submit"
                  variant="contained"
                  color="primary"
                  className="mr-2"
                  disabled={createLoading}
                >
                  {createLoading ? <CircularProgress color="inherit" className={classes.prgressColor} /> : <>Submit</>}
                </MaterialButton>{' '}
                <MaterialButton variant="contained" color="primary" onClick={cancelCreateProduct}>
                  Close
                </MaterialButton>
              </Modal.Footer>
            </Form>
          </Modal>
        </>
      );
    }
  };

  const deleteHandler = (id, e) => {
    e.preventDefault();
    confirmAlert({
      customUI: ({ onClose }) => {
        return (
          <div className="custom-ui">
            <h1 className="font-weight-bold text-white">Are you sure?</h1>
            <p>You want to delete this product?</p>
            <MaterialButton
              variant="contained"
              color="primary"
              onClick={() => {
                dispatch(deleteProduct(id));
                onClose();
              }}
            >
              Yes, Delete it !
            </MaterialButton>
            <MaterialButton variant="contained" color="primary" onClick={onClose}>
              No
            </MaterialButton>
          </div>
        );
      },
    });
  };

  return (
    <>
      {deleteSuccess && (
        <SuccessMessage
          header="Done"
          message="Product Deleted Successfully"
          reset={productConstants.DELETE_PRODUCT_RESET}
        />
      )}
      {deleteFail && (
        <ErrorMessage
          header="Something went wrong"
          message={deleteFail}
          reset={productConstants.DELETE_PRODUCT_RESET}
        />
      )}
      <Row>
        <Col>
          <h1>Products({count})</h1>
        </Col>
        <Col className="text-right">
          <MaterialButton variant="contained" color="primary" onClick={() => setOpenForm(true)}>
            <i className="fas fa-plus mr-2"></i> Add Product
          </MaterialButton>
        </Col>
      </Row>
      {loading ? (
        <TableLoader />
      ) : error ? (
        <ErrorMessage header="Something went wrong" message={error} />
      ) : (
        <>
          <Table striped bordered hover responsive className="table-sm">
            <thead>
              <tr>
                <th>ID</th>
                <th>NAME</th>
                <th>PRICE</th>
                <th>CATEGORY</th>
                <th>BRAND</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product._id}>
                  <td>{product._id}</td>
                  <td>{product.name}</td>
                  <td>₹{product.price}</td>
                  <td>{product.category}</td>
                  <td>{product.brand}</td>
                  <td>
                    <LinkContainer
                      to={interpolate(routes.PRODUCT_EDIT, {
                        productId: product._id,
                      })}
                    >
                      <Button variant="light" className="btn-sm">
                        <i className="fas fa-edit"></i>
                      </Button>
                    </LinkContainer>
                    <Button variant="danger" className="btn-sm" onClick={(e) => deleteHandler(product._id, e)}>
                      <i className="fas fa-trash"></i>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </>
      )}
      {openNewProductForm()}
    </>
  );
};

export default ProductList;
