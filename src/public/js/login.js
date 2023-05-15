const form = document.getElementById('loginForm')

form.addEventListener('submit', e=> {
    e.preventDefault();
    const data = new FormData(form);
    const reqBody = {}
    data.forEach((value, key)=>reqBody[key]=value);
    fetch('/api/sessions/login', {
        method: "POST",
        body: JSON.stringify(reqBody),
        headers:{
            'Content-Type':'application/json'
        }
    }).then(result => {
        if(result.status===200){
            window.location.replace('/products')
        } else if (result.status === 401){
            console.log(result);
            alert("Login invalido revisa tus credenciales!");
        }
    })
})