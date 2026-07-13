import {Button} from '@mui/material'

const SubmitButton = () => {
    return (
        <Button variant='contained' onClick={() => alert
            ("눌러주셔서 감사합니다.")}>
            눌러주세요!
            </Button>
    )
}

export default SubmitButton