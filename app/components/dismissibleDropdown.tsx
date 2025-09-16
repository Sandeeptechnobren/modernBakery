"use client";

import React, { useRef, useEffect } from "react";

interface DismissibleDropdownProps {
    isOpen: boolean;
    setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
    button: React.ReactNode;
    dropdown: React.ReactNode;
}

export default function DismissibleDropdown({
    isOpen,
    setIsOpen,
    button,
    dropdown,
}: DismissibleDropdownProps) {
    // Explicitly type the ref to be an HTMLDivElement or null
    const wrapperRef = useRef<HTMLDivElement>(null);

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    useEffect(() => {
        // Function to handle clicks outside of the component
        function handleClickOutside(event: MouseEvent) {
            // Check if the ref exists and if the clicked target is a node
            if (wrapperRef.current && event.target instanceof Node) {
                if (!wrapperRef.current.contains(event.target)) {
                    setIsOpen(false);
                }
            }
        }

        // Add the event listener to the document when the component mounts
        document.addEventListener("mousedown", handleClickOutside);

        // Clean up the event listener when the component unmounts
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []); // The dependency array is empty because the logic doesn't depend on wrapperRef

    return (
        <div className="relative" ref={wrapperRef}>
            <div onClick={toggleDropdown} className="cursor-pointer flex items-center">{button}</div>
            {isOpen && (
                <div>
                    {dropdown}
                </div>
            )}
        </div>
    );
}
