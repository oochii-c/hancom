const imgA = "https://item.kakaocdn.net/do/30c37dea66306072603da19064ce6ba7934a8bea49f711d785ad9144e9c20713"
const imgB = "https://d2gfz7wkiigkmv.cloudfront.net/pickin/2/7/5/pu-Vr4w7RhK3UjSZSExy_Q"

const myImage = document.querySelector("#pic")
myImage.setAttribute("src", imgA)

myImage.onclick = () => {
    const mySrc =  myImage.getAttribute("src");
    if (mySrc === imgA) {
        myImage.setAttribute("src", imgB);
    } else {myImage.setAttribute("src", imgA);}
}