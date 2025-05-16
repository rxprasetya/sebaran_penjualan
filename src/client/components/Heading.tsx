import React from "react"

interface HeadingProps {
    title: string
}

const Heading: React.FC<HeadingProps> = ({ title }) => {
    return (
        <div className="page-heading">
            <h3>{title}</h3>
        </div>
    )
}

export default Heading