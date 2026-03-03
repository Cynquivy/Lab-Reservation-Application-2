export type Activity<TID = string, TDate = string> = {
    user: TID;
    reservation: TID;
    action: "reserved" | "cancelled";
    seatNumber: number;
    labName: string;
    timestamp: TDate;
}
export type ActivityDTO = Activity;

export type Building<TID = string, TDate = string> = {
    name: string,
    floors: number,
}
export type BuildingDTO = Building;

export type Lab<TID = string, TDate = string> = {
    name: string,
    building: TID,
    floor: number,
    totalSeats: number,
    location?: string,
    layout: {
        type: "seat" | "table";
        xCoord: number;
        yCoord: number;
        width?: number;
        height?: number;
        status?: "available" | "reserved" | "unavailable";
        reservedBy?: TID | null;
    }[],
    isActive?: boolean;
}
export type LabDTO = Lab;

export type Reservation<TID = string, TDate = string> = {
    user: TID;
    lab: TID;
    seatNumber: number;
    date: TDate;
    dateRequested: TDate;
    startTime: TDate;
    endTime: TDate;
    status?: "upcoming" | "today" | "past" | "cancelled";  
}
export type ReservationDTO = Reservation;

export type User<TID = string, TDate = string> = {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role?: "Student" | "Admin";
    profileImage?: string;
    isActive?: boolean;
    studentID?: string;
    course?: string;
    contactNumber?: string;
}
export type UserDTO = User;
