const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require("path");
 
class InvoiceGenerator {
    constructor(invoice) {
        this.invoice = invoice
    }

    generateHeaders(doc) {
        const logoPath = path.join(__dirname,'../../public/images/mail_logo_pdf.jpg')     
          doc
           .image(logoPath, 0, 0, { width: 250})
            .fillColor('#000')
            .fontSize(20)
            .text('INVOICE', 275, 50, {align: 'right'})
            .fontSize(10)
            .text(`Invoice Number: ${this.invoice.orderId}`, {align: 'right'})
            .text(`Payment Status ${(this.invoice.payment_status)=='paid'?"Paid":""}`, {align: 'right'})
            .text(`Paid Amount: $${this.invoice.amount - this.invoice.coupon}`, {align: 'right'})
           .moveDown()
           //.text(`Billing Address:\n ${billingAddress.name}\n${billingAddress.address}\n${billingAddress.city}\n${billingAddress.state},${billingAddress.country}, ${billingAddress.postalCode}`, {align: 'right'})
    
        const beginningOfPage = 50
        const endOfPage = 550

        doc.moveTo(beginningOfPage,200)
            .lineTo(endOfPage,200)
            .stroke()
                
        doc.text(`Order Id: ${this.invoice.orderId || 'N/A'}`, 50, 210)
        doc.text(`Name: ${this.invoice.userId.firstName+" "+ this.invoice.userId.lastName || 'N/A'}`,50, 230)
        doc.text(`EMail: ${this.invoice.userId.email || 'N/A'}`, 320, 210)
        doc.text(`Contact: ${this.invoice.userId.mobile || 'N/A'}`, 320, 230)
        doc.moveTo(beginningOfPage,250)
            .lineTo(endOfPage,250)
            .stroke()

    }

     generateTable(doc) {
        const tableTop = 270
         const itemCodeX = 50
         const descriptionX = 100
         const quantityX = 380
         const priceX = 450
         const amountX = 501

         doc.fontSize(10)
            .text('Sr. No', itemCodeX, tableTop, {bold: true})
            .text('Product Title', descriptionX, tableTop)
            .text('Quantity', quantityX, tableTop)
            .text('Price', priceX, tableTop)
            .text('Amount', amountX, tableTop)

         const items = this.invoice.items
         let i = 0
         let count =0;
         const beginningOfPage = 50
        const endOfPage = 550
         for (i = 0; i < items.length; i++) {
                 const item = items[i]
                 const y = tableTop + 25 + (i * 25)
                 count = count+1
                 doc
                     .fontSize(10)
                     .text(count, itemCodeX, y)
                     .text(item.productTile, descriptionX, y)
                     .text(item.quantity, quantityX, y)
                     .text(`$ ${item.price}`, priceX, y)
                     .text(`$ ${item.total}`, amountX, y)
             }
             doc.text(`Discount:` , 50,310)
             doc.text(`$ ${this.invoice.coupon}`, 507,310)
             doc.moveTo(beginningOfPage,350)
             .lineTo(endOfPage,350)
             .stroke()
             .text(`$ ${this.invoice.amount - this.invoice.coupon}`, 502,355)
             doc.moveTo(beginningOfPage,370)
             .lineTo(endOfPage,370)
             .stroke()
 

      }

    generateFooter(doc) {
        doc
            .fontSize(10)
            .text(`Payment paid. `, 50, 700, {
                align: 'center'
            })
    }

    generate(req,res) {
        let theOutput = new PDFDocument({ bufferPages: true })
      
 
         //   console.log(this.invoice)

          const fileName = path.join(__dirname,`../../pdf/Invoice_${this.invoice.orderId}.pdf`)
        
        // pipe to a writable stream which would save the result into the same directory
        theOutput.pipe(fs.createWriteStream(fileName))
    
        this.generateHeaders(theOutput)

        theOutput.moveDown()

        this.generateTable(theOutput)

        this.generateFooter(theOutput)
     
       
        theOutput.end()

       

        //      const stream = res.writeHead(200, {
        //     'Content-Type': 'application/pdf',
        //     'Access-Control-Allow-Origin': '*',
        //     'Content-disposition': `attachment;filename=${fileName}`,
        //   });
        // theOutput.on('data', (chunk) => stream.write(chunk));
        //   theOutput.on('end', () => stream.end());
        // write out file
    }
}

module.exports = InvoiceGenerator