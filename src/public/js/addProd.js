const addProdToCart = (id, cartId) => {

    /*
    fetch('/js/test.js')
  .then(response => response.text())
  .then(data => {
    // Evaluate the function and use it
    const myFunction = eval(data);
  })
  
  const response = await fetch('/js/test.js');
  const data = await response.text()
  const funcion = await eval(data)
  */

  fetch(`http://localhost:8080/mongodb/api/carts/${cartId}/product/${id}`, {
    method: 'POST',
    mode: "cors",
  })
  .then(result => {
    if(result.status==200){
      alert("producto agregado");
    }
  });
  
};

const logOut = () => {
  fetch(`http://localhost:8080/api/sessions/logout`, {
    method: 'GET',
    mode: "cors",
  })
  .then(result => {
    if(result.status==200){
      window.location.replace('/users/login')
    }
  });
}

/*
const goToCart = (id) => {
  fetch(`http://localhost:8080/carts/${id}`, {
    method: 'GET',
    mode: "cors",
  })
  .then(result => {
    if(result.status==200){
      window.location.replace(`/carts/${id}`)
    }
  });
}
*/

const goToCart = (id)=> {
  window.location.replace(`/carts/${id}`)
}