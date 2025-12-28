export type PrintOrderInput = {
  projectId: string;
  pdfKey: string;
};

export type PrintOrderStatus = 'created' | 'processing' | 'shipped';

export interface PrintProvider {
  createOrder(input: PrintOrderInput): Promise<{ orderId: string; status: PrintOrderStatus; trackingNumber?: string }>;
  getOrderStatus(orderId: string): Promise<{ status: PrintOrderStatus; trackingNumber?: string }>;
}

export class MockPrintProvider implements PrintProvider {
  async createOrder(input: PrintOrderInput) {
    return {
      orderId: `mock-${input.projectId}`,
      status: 'shipped',
      trackingNumber: 'TRACK123456'
    };
  }

  async getOrderStatus(orderId: string) {
    return { status: 'shipped', trackingNumber: `${orderId}-TRACK` };
  }
}
