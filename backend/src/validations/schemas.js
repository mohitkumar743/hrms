import { z } from 'zod';

export const loginSchema = z.object({
  body: z.object({ email: z.string().email(), password: z.string().min(6) })
});

export const refreshSchema = z.object({
  body: z.object({ refreshToken: z.string().min(10) })
});

export const companySchema = z.object({
  body: z.object({
    name: z.string().min(2),
    legalName: z.string().optional(),
    industry: z.string().optional(),
    companyType: z.string().optional(),
    registrationNumber: z.string().optional(),
    gstNumber: z.string().optional(),
    panNumber: z.string().optional(),
    email: z.string().email().optional().or(z.literal('')),
    phone: z.string().optional(),
    website: z.string().url().optional().or(z.literal('')),
    addressLine1: z.string().optional(),
    addressLine2: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    country: z.string().optional(),
    pincode: z.string().optional(),
    contactPersonName: z.string().optional(),
    contactPersonEmail: z.string().email().optional().or(z.literal('')),
    contactPersonPhone: z.string().optional(),
    adminName: z.string().optional(),
    adminEmail: z.string().email().optional().or(z.literal('')),
    adminPassword: z.string().min(6).optional().or(z.literal('')),
    establishedDate: z.string().optional(),
    employeeStrength: z.string().optional(),
    status: z.enum(['ACTIVE', 'INACTIVE']).optional()
  })
});

export const companyUpdateSchema = z.object({
  params: z.object({ id: z.string() }),
  body: companySchema.shape.body.partial()
});

export const employeeSchema = z.object({
  body: z.object({
    employeeCode: z.string().min(1),
    fullName: z.string().min(2),
    phone: z.string().min(6),
    email: z.string().email(),
    password: z.string().min(6),
    department: z.string().min(1),
    designation: z.string().min(1),
    joiningDate: z.string().min(8),
    monthlySalary: z.number().nonnegative(),
    shiftStart: z.string().optional(),
    shiftEnd: z.string().optional(),
    status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
    qrCode: z.string().optional()
  })
});

export const employeeUpdateSchema = z.object({
  body: employeeSchema.shape.body.partial().omit({ password: true }),
  params: z.object({ id: z.string() })
});

export const idParamSchema = z.object({ params: z.object({ id: z.string() }) });

export const attendanceScanSchema = z.object({
  body: z.object({ qrCode: z.string().min(3), type: z.enum(['CHECK_IN', 'CHECK_OUT']) })
});

export const attendanceSelfPunchSchema = z.object({
  body: z.object({ type: z.enum(['CHECK_IN', 'CHECK_OUT']) })
});

export const activityPageViewSchema = z.object({
  body: z.object({
    path: z.string().min(1),
    title: z.string().optional()
  })
});

export const attendanceManualCheckoutSchema = z.object({
  params: z.object({ id: z.string() }),
  body: z.object({ checkOutTime: z.string().regex(/^\d{2}:\d{2}$/) })
});

export const attendanceRegularizeSchema = z.object({
  params: z.object({ id: z.string() }),
  body: z.object({
    checkInTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
    checkOutTime: z.string().regex(/^\d{2}:\d{2}$/).optional()
  })
});

export const leaveSchema = z.object({
  body: z.object({
    employeeId: z.string().min(1).optional(),
    leaveType: z.enum(['Casual Leave', 'Sick Leave', 'Unpaid Leave']),
    dayType: z.enum(['HALF_DAY', 'FULL_DAY']),
    startDate: z.string().min(8),
    endDate: z.string().min(8),
    reason: z.string().min(3)
  })
});

export const leaveDecisionSchema = z.object({
  params: z.object({ id: z.string() }),
  body: z.object({
    status: z.enum(['APPROVED', 'REJECTED']),
    remark: z.string().optional()
  })
});

export const noticeSchema = z.object({
  body: z.object({
    title: z.string().min(2),
    message: z.string().min(3),
    expiryDate: z.string().optional().nullable(),
    isActive: z.boolean().optional()
  })
});

export const eventSchema = z.object({
  body: z.object({
    title: z.string().min(2),
    eventDate: z.string().min(8),
    startTime: z.string().regex(/^\d{2}:\d{2}$/),
    endTime: z.string().regex(/^\d{2}:\d{2}$/),
    lead: z.string().optional(),
    expiryDate: z.string().optional().nullable(),
    isActive: z.boolean().optional()
  })
});

export const payrollGenerateSchema = z.object({
  body: z.object({ month: z.string().regex(/^\d{4}-\d{2}$/) })
});

export const settingsSchema = z.object({
  body: z.object({
    companyProfile: z.object({ name: z.string(), timezone: z.string() }).optional(),
    officeStartTime: z.string().optional(),
    officeEndTime: z.string().optional(),
    gracePeriodMinutes: z.number().nonnegative().optional(),
    lateFineEnabled: z.boolean().optional(),
    lateFineAmount: z.number().nonnegative().optional(),
    lateCountThreshold: z.number().int().nonnegative().optional()
  })
});

export const pageSchema = z.object({
  body: z.object({
    label: z.string().min(2),
    path: z.string().min(1),
    icon: z.string().min(1),
    parentId: z.string().nullable().optional(),
    roles: z.array(z.enum(['SUPER_ADMIN', 'COMPANY_ADMIN', 'EMPLOYEE'])).min(1),
    sortOrder: z.number().int().nonnegative().optional(),
    isActive: z.boolean().optional()
  })
});

export const pageUpdateSchema = z.object({
  params: z.object({ id: z.string() }),
  body: pageSchema.shape.body.partial()
});

export const pagePermissionSchema = z.object({
  params: z.object({ companyId: z.string() }),
  body: z.object({
    pageIds: z.array(z.string())
  })
});
