import { useState, useEffect, useContext } from "react";
import { useWeb3Contract, useMoralis } from "react-moralis"
import { ConnectionContext } from "../index"

export default function TestPeopleWithContext() {
    const {isWeb3Enabled} = useMoralis() 
    let [ person, setPerson ] = useState(null)
    let [ name, setName ] = useState("")
    let [ age, setAge ] = useState(0)
    let [ population, setPopulation ] = useState(1)
    let [ selectedPerson, setSelectedPerson ] = useState(0)

    //let abi = conn.connInfo["myAbi"]
    //let contractAddress = conn.connInfo["myAddr"]
    const { myAbi: abi, myAddr: contractAddress } = useContext(ConnectionContext)

    const { runContractFunction: getPerson } = useWeb3Contract({
        abi: abi,
        contractAddress: contractAddress,
        functionName: "getPerson",
        params: {n: selectedPerson}
    })

    const { runContractFunction: addNewPerson } = useWeb3Contract({
        abi: abi,
        contractAddress: contractAddress,
        functionName: "newPerson",
        params: { _name: name, _age: age }
    })

    const { runContractFunction: getPopulation } = useWeb3Contract({
        abi: abi,
        contractAddress: contractAddress,
        functionName: "getPopulation",
        params: {}//, msgValue: 0
    })

    useEffect(() => {
        if (isWeb3Enabled && person) {
            showInfo()
        }
    }, [isWeb3Enabled])
    
    async function showInfo() {
        if (contractAddress) {
            const thePopulation = (await getPopulation()).toString()
            const thePerson = (await getPerson()).toString()
            setPopulation(thePopulation)
            setPerson(thePerson)
        }
    }

    const handleNewPerson = async (tx) => {
        try {
            await tx.wait(1)
            setPopulation(population+1)
            await showInfo()
            setName("")
            setAge(null)
        } catch (e) {
            console.log(e)
        }
    }

    const updateName = (e) => {
        setName(e.target.value)
    }

    const updateAge = (e) => {
        setAge(e.target.value)
    }

    const onAddNewPerson = async () => {
        addNewPerson()
    }

    function changePop(e) {
        setSelectedPerson(e.target.value)
        showInfo()
    }

    return (
        <>
            <div style={{ padding: 20 + "px", backgroundColor:  "#111519" }}>{contractAddress}
                { contractAddress ? (<h2>{contractAddress}</h2>) : (<h3>no contract attached</h3>)}

                { person ? (
                    <>
                        <div><h3>There are:</h3> {population} people</div>
                        <div><h3>The person is:</h3> {person.split(',')[1]}</div>
                        <div><h3>... and their address:</h3> {person.split(',')[3]}</div>
                    </>
                    ) : ( 
                        <div>No Person</div>
                    )
                }
                <br/>
                
                <div>
                    <p>Name:</p>
                    <input 
                        type="text"
                        onChange={updateName}
                    />
                    <p>Age</p>
                    <input 
                        type="text"
                        onChange={updateAge}
                    /><br/>
                    <button
                        type="button" 
                        onClick={ async () => 
                            await onAddNewPerson({
                                //onComplete:
                                onSuccess: handleNewPerson,
                                onError: (error) => console.log(error),
                            })
                        }
                    >Add Person</button>

                    <br/><br/><br/>

                    <select
                        onChange={changePop}
                    >
                        <option value={0}>0</option>
                        <option value={1}>1</option>
                        <option value={2}>2</option>
                        <option value={3}>3</option>
                    </select>

                    <button
                        type="button"
                        onClick={ async () => await showInfo() }
                    >update info</button>
                </div>
            </div>
        </>
    )
}